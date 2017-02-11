var elmRouter = require('../../src/elm-router');

var mockElm = {};
var mockPorts = [];
var mockTestPort = {};
var mockInstantiatedWorkers = {};

function mockInstantiatedApp(cmdPorts, subPorts) {
  const app = {ports: {}};

  cmdPorts.forEach(port => {
    app.ports[port] = {subscribe: jest.fn()}
  });

  subPorts.forEach(port => {
    app.ports[port] = {send: jest.fn()}
  });

  return app;
}

function mockWorker(name, cmdPorts, subPorts) {
  mockInstantiatedWorkers[name] = mockInstantiatedApp(cmdPorts, subPorts);

  mockElm[name] = {
    App: {
      worker: jest.fn(() => mockInstantiatedWorkers[name])
    }
  };
}

function port(portName) {
  return mockInstantiatedWorkers.ElmRouter.ports[portName].subscribe.mock.calls[0][0];
}

function testCmd() {
  console.log('testCmd ran');
}

describe('elm-router', () => {
  beforeEach(() => {
    mockTestPort = {
      register: ports => {
        ports.testCmd.subscribe(testCmd);
      },
      samplePortName: 'testCmd'
    };

    mockInstantiatedWorkers = {};
    mockPorts = [
      mockTestPort
    ];

    mockWorker('ElmRouter', [
      'routerWorker',
      'routerEmbed',
      'routerLog',
      'routerBroadcastUrlUpdate'
    ], [
      'routerReceiveCmd'
    ]);

    mockWorker('TestWorker', ['testCmd'], ['testSub']);

    elmRouter.start(mockElm, mockPorts);
  });

  describe('start', () => {
    test('launches the ElmRouter app', () => {
      expect(mockElm.ElmRouter.App.worker).toHaveBeenCalledWith(undefined); // Called with no flags
    });
  });

  describe('routerWorker', () => {
    beforeEach(() => {
      port('routerWorker')(['TestWorker']);
    });

    test('launches a worker if the given app exists', () => {
      expect(mockElm.TestWorker.App.worker).toHaveBeenCalledWith(undefined); // Called with no flags
    });

    test('registers ports for the worker', () => {
      expect(mockInstantiatedWorkers.TestWorker.ports.testCmd.subscribe).toHaveBeenCalledWith(testCmd);
    });

    test('throws an Error if `register` was not defined', () => {

    });

    test('throws an Error if `samplePortName` was not defined', () => {

    });
  });

  describe('routerEmbed', () => {
    test('embeds an Html app if it exists', () => {

    });

    test('registers ports for the embedded app', () => {

    });

    test('throws an Error if `register` was not defined', () => {

    });

    test('throws an Error if `samplePortName` was not defined', () => {

    });

    test('throws an Error if a DOM node is not found matching the selector', () => {

    });
  });

  describe('routerBroadcastUrlUpdate', () => {
    test('send an urlUpdate port message to all live Elm apps with `urlUpdate`', () => {

    });

    test('defaults `username`, `password`, and `origin` to an empty string if undefined/falsy (IE10 issue)', () => {

    });
  });
});
