class Logger {

    /**
     * Logs a message to the console.
     * @param message - The message to log.
     */
    static log(message) {
        let d = Date.now();
        let hour = new Intl.DateTimeFormat('en', {hour: 'numeric', hourCycle: 'h23'}).format(d);
        let minute = new Intl.DateTimeFormat('en', {minute: 'numeric', hourCycle: 'h23'}).format(d);
        if (parseInt(minute) < 10) minute = '0' + minute;
        let second = new Intl.DateTimeFormat('en', {second: 'numeric', hourCycle: 'h23'}).format(d);
        if (parseInt(second) < 10) second = '0' + second;
        console.log(color(`&7[${hour}:${minute}:${second}] ` + message + '&r'));
    }

}

/**
 * Colorizes a string.
 * @param message - The string to colorize.
 * @returns {string} - The colorized string.
 */
function color(message) {
    return message.replace("&f", "\u001B[37m")
        .replace(/&7/g, "\u001B[37m")
        .replace(/&4/g, "\u001B[31m")
        .replace(/&9/g, "\x1b[36m")
        .replace(/&e/g, "\x1b[33m")
        .replace(/&6/g, "\x1b[33m")
        .replace(/&a/g, "\u001B[32m")
        .replace(/&2/g, "\u001B[32m")
        .replace(/&r/g, "\x1b[0m")
}

module.exports.Logger = Logger;