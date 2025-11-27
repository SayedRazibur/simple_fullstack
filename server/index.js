/* eslint-disable no-console */
/* eslint-disable no-undef */
import chalk from 'chalk';
import { httpServer, io, PORT } from './app.js';
import config from './src/config/index.js';
import prisma from './src/config/prisma.js';

const SHUTDOWN_TIMEOUT = 15000;
const isDevelopment = config.NODE_ENV === 'development';
let isShuttingDown = false;

const gracefulShutdown = async (signal) => {
  if (isShuttingDown) {
    console.log(chalk.yellow('⚠️ Shutdown already in progress...'));
    return;
  }
  isShuttingDown = true;

  console.log(
    chalk.yellow.bold(
      `\n⚡ ${signal} received. Initiating graceful shutdown...`
    )
  );

  const shutdownTimer = setTimeout(() => {
    console.error(chalk.red.bold('Shutdown timeout exceeded. Forcing exit.'));
    process.exit(1);
  }, SHUTDOWN_TIMEOUT);

  shutdownTimer.unref();

  try {
    await new Promise((resolve, reject) => {
      httpServer.close((err) => {
        if (err) {
          console.error(chalk.red('✗ Error closing HTTP server:'), err.message);
          reject(err);
        } else {
          console.log(chalk.green('✓ HTTP server closed'));
          resolve();
        }
      });
    });

    await new Promise((resolve) => {
      io.close(() => {
        console.log(chalk.green('✓ Socket.IO server closed'));
        resolve();
      });
    });
    await prisma.$disconnect();
    console.log(chalk.green('✓ Database connection closed'));

    clearTimeout(shutdownTimer);
    console.log(
      chalk.green.bold('✓ Graceful shutdown completed successfully\n')
    );
    process.exit(0);
  } catch (error) {
    console.error(chalk.red('✗ Error during shutdown:'), error.message);
    clearTimeout(shutdownTimer);
    process.exit(1);
  }
};

const startServer = async () => {
  try {
    console.log(chalk.cyan('🔄 Connecting to database...'));
    await prisma.$connect();

    await prisma.$queryRaw`SELECT 1`;
    console.log(chalk.green.bold('✓ Database connected successfully'));

    httpServer.listen(PORT, () => {
      console.log(chalk.blue.bold('\n🚀 Server started successfully!'));
      console.log(chalk.cyan(`URL: http://localhost:${PORT}`));
      console.log(chalk.cyan(`Docs: http://localhost:${PORT}/api/docs`));
      console.log(
        chalk.gray(`Environment: ${config.NODE_ENV || 'development'}`)
      );
      // console.log(chalk.gray(`Process ID: ${process.pid}`));
      // console.log(chalk.gray(`Node Version: ${process.version}\n`));
    });

    httpServer.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(chalk.red.bold(`✗ Port ${PORT} is already in use`));
      } else if (error.code === 'EACCES') {
        console.error(
          chalk.red.bold(`✗ Port ${PORT} requires elevated privileges`)
        );
      } else {
        console.error(chalk.red.bold('✗ Server error:'), error.message);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error(chalk.red.bold('\n✗ Failed to start server'));
    console.error(chalk.red('Error:'), error.message);
    if (isDevelopment) console.error(chalk.red('Stack:'), error.stack);
    process.exit(1);
  }
};
process.on('uncaughtException', (error) => {
  console.error(chalk.red.bold('\n🔥 UNCAUGHT EXCEPTION! Shutting down...'));
  console.error(chalk.red('Error:'), error.message);
  if (isDevelopment) console.error(chalk.red('Stack:'), error.stack);
  gracefulShutdown('Uncaught Exception');
});

startServer();

process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red.bold('\n💥 UNHANDLED REJECTION! Shutting down...'));
  console.error(chalk.red('Reason:'), reason);
  if (isDevelopment) console.error(chalk.red('Promise:'), promise);
  gracefulShutdown('Unhandled Rejection');
});

const signals = ['SIGINT', 'SIGTERM', 'SIGHUP'];
signals.forEach((signal) => process.on(signal, () => gracefulShutdown(signal)));

if (isDevelopment) {
  process.on('warning', (warning) => {
    console.warn(chalk.yellow('⚠️ Process Warning:'));
    console.warn(chalk.yellow(`Name: ${warning.name}`));
    console.warn(chalk.yellow(`Message: ${warning.message}`));
    if (warning.stack) console.warn(chalk.yellow(`   Stack: ${warning.stack}`));
  });
}

if (isDevelopment) {
  process.on('multipleResolves', (type, promise, reason) => {
    console.warn(chalk.yellow('⚠️  Multiple Resolves Detected:'));
    console.warn(chalk.yellow(`   Type: ${type}`));
    console.warn(chalk.yellow(`   Reason: ${reason}`));
  });
}
