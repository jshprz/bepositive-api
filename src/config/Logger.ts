import { createLogger, format, transports } from 'winston';
const { combine, printf } = format;

/**
 * To use this logger dependency, it is recommended to follow the format pretty much similar to these:
 * *passing a payload argument is optional.
 *
 * .error({label: string, message: string, payload: {}});
 * .warn({label: string, message: string, payload: {}});
 * .info({label: string, message: string, payload: {}});
 * .debug({label: string, message: string, payload: {}});
 */
const myFormat = printf(({ level, message }) => {
    const logLevel = level.toUpperCase();

    // We do not include the date in the log if our environment is in dev, staging, or production.
    // because we use AWS Cloudwatch there. The log data and time is taken care of for us.
    const logDate = (process.env.NODE_ENV === 'local')? `[${new Date().toLocaleString()}]` : '';

    // Log returns the combination of datetime, context of the log (eg. ForgotPassword.ts), log message
    return `${logDate}[${logLevel}]: ${message}`;
});

const logger = createLogger({
    level: 'info',
    format: combine(
        myFormat
    ),
    transports: [
        new transports.Console()
    ]
});


function log(level, context, args) {
    let msg = '[' + context + ']';
    let err;
    args.forEach(arg => {
        msg += ' ';
        if (typeof arg == "object") {
            if (arg && arg.stack && arg.message) {
                // Duck type for Error
                err = arg;
            } else {
                msg += JSON.stringify(arg);
            }
        } else {
            msg += arg;
        }
    })

    logger.log(level, msg, err);
}

const Logger = {
    createLogger(context) {
        if (!context) context = "???";
        return {
            debug(...args) {
                log('debug', context, args);
            },
            info(...args) {
                log('info', context, args);
            },
            warn(...args) {
                log('warn', context, args);
            },
            error(...args) {
                log('error', context, args);
            },
        }
    }
}

export default Logger;