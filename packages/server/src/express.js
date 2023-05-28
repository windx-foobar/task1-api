const express = require('express');
const qs = require('qs');
// const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const { camelCase } = require('lodash');
const morgan = require('morgan');
const cors = require('cors');
const { decode } = require('qs/lib/utils');

function addModules(app, modules = [], isDev = false) {
  const modulesManager = {
    // helmet() {
    //   app.use(helmet());
    // },
    compression() {
      app.use((req, res, next) => {
        if (req.headers['x-no-compression']) {
          return next();
        }

        return compression()(req, res, next);
      });
    },
    requestLogger() {
      app.use(
        morgan(isDev ? 'dev' : 'tiny', {
          stream: {
            write: (path) => {
              if (/.*(favicon.ico).*/.test(path)) return false;
              return console.log(path.trim());
            }
          }
        })
      );
    },
    cors({ whitelist = [] } = {}) {
      app.use(
        cors({
          credentials: true,
          exposedHeaders: 'file-name',
          origin(origin, cb) {
            if (!origin) return cb(null, true);
            if (whitelist.includes(origin)) return cb(null, true);

            cb(new Error('Not allowed by CORS'));
          }
        })
      );
    }
  };

  modules.filter(Boolean).forEach((moduleNameOrArray) => {
    let moduleName;
    let moduleOptions;

    if (Array.isArray(moduleNameOrArray)) {
      const [_moduleName, _moduleOptions] = moduleNameOrArray;

      moduleName = camelCase(_moduleName);
      moduleOptions = _moduleOptions;
    } else {
      moduleName = camelCase(moduleNameOrArray);
    }

    modulesManager[moduleName] && modulesManager[moduleName](moduleOptions);
  });
}

function createServer(modules = [], isDev = false) {
  const app = express();

  app.set('query parser', (string) => {
    return qs.parse(string, {
      decoder: (str) => {
        if (str === 'true') return true;
        if (str === 'false') return false;

        return decode(str);
      }
    });
  });

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json({ limit: '50mb' }));
  app.use(cookieParser());

  addModules(app, modules, isDev);

  return app;
}

function createRouter() {
  return express.Router();
}

module.exports = { createServer, createRouter };
