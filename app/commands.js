const cugrande = require('./commands/cuGrande.command'),
    apoio = require('./commands/apoio.command'),
    bala = require('./commands/bala.command'),
    play = require('./commands/play.command');

const commands = {
    cugrande,
    apoio,
    bala,
    play
};

module.exports = async (msg) => {
    let tokens = msg.content.split(" ");
    let command = tokens.shift();
    if (command.charAt(0) !== '$') return;

    command = command.substring(1);
    commands[command](msg, tokens);
}