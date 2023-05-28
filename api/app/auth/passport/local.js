import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

const WRONG_CREDENTIALS = { message: 'Введено неверное имя пользователя или пароль' };
const USER_IS_BLOCKED = { message: 'Пользователь заблокирован' };

export function setup(models) {
  passport.use(
    'local',
    new LocalStrategy(
      {
        usernameField: 'username',
        passwordField: 'password',
        session: false
      },
      async (username, password, done) => {
        if (!username || !password) return done(null, false, WRONG_CREDENTIALS);

        try {
          const usersRow = await models.users.unscoped().findByEmailOrPhone(username, {});
          if (!usersRow) return done(null, false, WRONG_CREDENTIALS);

          const authenticated = await usersRow.authenticate(password);
          if (!authenticated) return done(null, false, WRONG_CREDENTIALS);

          if (usersRow.lockedAt) return done(null, false, USER_IS_BLOCKED);

          return done(null, usersRow);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
}
