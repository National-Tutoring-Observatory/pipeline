export default class LocalWorker {

  name;
  file;
  isProcessing = false;
  interval;

  constructor(name, file) {
    this.name = name;
    this.file = file;
    this.init();
  }

  init = () => {
    this.interval = setInterval(async () => {
      if (this.isProcessing) {
        return;
      }

      console.log('...waiting...');

    }, 3000);
  }

  on = (event, callback) => {
    // TODO: Create a listening function
    console.log('On event', event);
  }

  close = () => {
    clearInterval(this.interval);
  }
}