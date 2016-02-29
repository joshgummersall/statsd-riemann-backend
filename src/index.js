import Riemann from './lib/riemann';

function init(startupTime, config, events) {
  const riemannInstance = new Riemann(startupTime, config, events);
  return true;
};

export {init};
