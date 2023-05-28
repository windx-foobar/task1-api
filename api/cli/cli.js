const mri = require('mri');
const migrateCommands = require('./commands/migrate');

const commandsMap = {
  'migrate:up': migrateCommands.up,
  'migrate:down': migrateCommands.down,
  seed: require('./commands/seed').process,
  init: require('./commands/init').process,

  async help() {
    console.log(
      `
Available commands:
${Object.keys(this)
  .map((name) => `  - ${name}`)
  .join('\n')}
`
    );
  }
};

async function main() {
  const args = mri(process.argv.slice(2), {
    boolean: ['help', 'fill'],
    string: ['email', 'password'],
    default: {
      email: 'admin@ya.ru',
      password: '123456'
    }
  });
  const command = args._[0];

  const availableCommands = Object.keys(commandsMap);

  if (availableCommands.includes(command)) {
    await commandsMap[command](args);
  } else {
    if (args.help) {
      await commandsMap.help();
    } else {
      throw new Error(`Unknown command ${command}! Available commands: ${availableCommands.join('|')}`);
    }
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
