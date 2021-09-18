import { createLogger, format, transports } from 'winston';
import { Service } from 'typedi';
import 'reflect-metadata';
const { combine, printf } = format;

type logMessageParamType = {label: string, message: string, payload?: {}};

/**
 * To use this logger dependency, it is recommended to follow the format pretty much similar to these:
 * *passing a payload argument is optional.
 *
 * .error({label: string, message: string, payload: {}});
 * .warn({label: string, message: string, payload: {}});
 * .info({label: string, message: string, payload: {}});
 * .http({label: string, message: string, payload: {}});
 * .debug({label: string, message: string, payload: {}});
 */

@Service()
class Logger {

  private _logger: any;

  constructor() {
    const myFormat = printf(({ level, message }) => {
      const logLevel = level.toUpperCase();

      // We do not include the date in the log if our environment is in dev, staging, or production.
      // because we use AWS Cloudwatch there. The log data and time is taken care of for us.
      const logDate = (process.env.NODE_ENV === 'local')? `[${new Date().toLocaleString()}]` : '';

      // Log returns the combination of datetime, context of the log (eg. ForgotPassword.ts), log message
      return `${logDate}[${logLevel}]: ${message}`;
    });
    this._logger = createLogger({
      level: 'info',
      format: combine(
        myFormat
      ),
      transports: [
        new transports.Console()
      ]
    });
  }

  error(message: logMessageParamType): void {
    this._log('error', message);
  }

  warn(message: logMessageParamType): void {
    this._log('warn', message);
  }

  info(message: logMessageParamType): void {
    this._log('info', message);
  }

  http(message: logMessageParamType): void {
    this._log('http', message);
  }

  debug(message: logMessageParamType): void {
    this._log('debug', message);
  }

  private _log(level: string, message: logMessageParamType): void {
    this._logger.log(level, JSON.stringify(message));
  }
}

export default Logger;