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

type argsType = { function?: string, message: string, payload: any };

function log(level: string, context: string, args: argsType) {
    let msg = '[' + context + '] ';
    msg += (args.function)? `function: ${args.function}, `: ' ';
    msg += `MESSAGE: ${JSON.stringify(args.message)}, `;
    msg += `DATA: ${JSON.stringify(args.payload)}`;

    logger.log(level, msg);
}

const Logger = {
    createLogger(context: string) {
        if (!context) context = "???";
        return {
            debug(args: argsType) {
                log('debug', context, args);
            },
            info(args: argsType) {
                log('info', context, args);
            },
            warn(args: argsType) {
                log('warn', context, args);
            },
            error(args: argsType) {
                log('error', context, args);
            },
        }
    }
}

export default Logger;