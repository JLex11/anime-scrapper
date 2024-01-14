import winston from 'winston'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: '../_logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: '../_logs/combined.log' })
  ]
})

logger.add(
  new winston.transports.Console({
    format: winston.format.simple()
  })
)

export default logger
