/**
 * parse
 * @param {*} argv 
 */
const parse = (argv = process.argv.slice(2)) =>
  argv.reduce((args, value) => {
    if (value.startsWith('--')) {
      const m = value.match(/^--(\w+)(=(.+))?$/);
      const k = m[1];
      const v = m[3] ? m[3] : true;
      args[k] = v;
    } else {
      args._.push(value);
    }
    return args;
  }, {
    _: []
  });

module.exports = parse;