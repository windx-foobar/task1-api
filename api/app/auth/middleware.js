import passport from 'passport';
import { accessDeniedError, handleRequestError } from '@innoagency-arenda/server/helpers';

export function login(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!user) return res.status(401).json(info);

    return req.login(user, { session: false }, (loginError) => {
      if (loginError) return res.status(401).json({ message: loginError.message });
      return next();
    });
  })(req, res, next);
}

export function isAuthenticated(req, res, next) {
  passport.authenticate('token', (err, user, info) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!user) return res.status(401).json(info);

    return req.login(user, { session: false }, (loginError) => {
      if (loginError) return res.status(401).json({ message: loginError.message });
      return next();
    });
  })(req, res, next);
}

// FIXME: реализовать hasRoles (для выбора из множества ролей) + hasPermissions (для выбора из множества прав)
export async function auth(req, res, next) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    req.hasRole = () => false;
    req.can = () => false;
    return next();
  }

  const { roles = [], permissions = [] } = await req.user.getAccess();
  req.hasRole = (role) => roles.includes(role);
  req.can = (permission) =>
    !!permissions.find((item) => {
      const [currentName, currentAction] = permission.split('.');
      const [name, action] = item.split('.');

      // Если разрешена запись, то разрешено и чтение.
      // Поэтому проверяем только наименование прав
      if (action === 'write') {
        return currentName === name;
      }

      return currentName === name && currentAction === action;
    });

  return next();
}

// FIXME: Доделать и экспортировать
function hasRoles(...roleOrRoles) {
  return (req, res, next) => {
    if (typeof req?.hasRoles !== 'function') return accessDeniedError('Доступ запрещен');

    let roles;
    if (arguments.length === 1) {
      roles = roleOrRoles[0];
      if (!Array.isArray(roles)) {
        roles = [roles];
      }
    } else {
      roles = roleOrRoles;
    }

    if (!req.hasRoles(roles)) return accessDeniedError('Доступ запрещен');

    return next();
  };
}

export function hasRole(role) {
  // FIXME: Заменить на это когда будет готово
  // return hasRoles(role);

  return (req, res, next) => {
    try {
      if (typeof req?.hasRole !== 'function') return accessDeniedError('Доступ запрещен');
      if (!req.hasRole(role)) return accessDeniedError('Доступ запрещен');

      return next();
    } catch (error) {
      return handleRequestError({ res, error });
    }
  };
}

// FIXME: Доделать и экспортировать
function hasPermissions(...permissionOrPermissions) {
  return (req, res, next) => {
    if (typeof req?.hasPermissions !== 'function') return accessDeniedError('Доступ запрещен');

    let permissions;
    if (arguments.length === 1) {
      permissions = permissionOrPermissions[0];
      if (!Array.isArray(permissions)) {
        permissions = [permissions];
      }
    } else {
      permissions = permissionOrPermissions;
    }

    if (!req.hasPermissions(permissions)) return accessDeniedError('Доступ запрещен');

    return next();
  };
}

export function hasPermission(permission) {
  // FIXME: Заменить на это когда будет готово
  // return hasPermissions(permission);

  return (req, res, next) => {
    try {
      if (typeof req?.can !== 'function') return accessDeniedError('Доступ запрещен');
      if (!req.can(permission)) return accessDeniedError('Доступ запрещен');

      return next();
    } catch (error) {
      return handleRequestError({ res, error });
    }
  };
}
