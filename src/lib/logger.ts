import winston from "winston";

/**
 * Logger for MCP server that writes to stderr (required for stdio transport)
 * Uses proper log levels: info, warn, error, debug
 */
export const logger = winston.createLogger({
	level: process.env.LOG_LEVEL || "info",
	format: winston.format.combine(
		winston.format.colorize(),
		winston.format.timestamp({ format: "HH:mm:ss" }),
		winston.format.printf(({ timestamp, level, message }) => {
			return `${timestamp} [${level}] ${message}`;
		}),
	),
	transports: [
		// Write to stderr (required for MCP stdio transport)
		new winston.transports.Console({
			stderrLevels: ["error", "warn", "info", "debug"], // All logs go to stderr
		}),
	],
});

/**
 * Disable all logging (useful for testing or production)
 */
export function disableLogging() {
	logger.transports.forEach((transport) => (transport.silent = true));
}

/**
 * Enable logging
 */
export function enableLogging() {
	logger.transports.forEach((transport) => (transport.silent = false));
}
