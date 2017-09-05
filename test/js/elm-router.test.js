var elmRouter = require('../../src/elm-router');

var mockElm = {};
var mockPorts = [];
var mockTestPort = {};
var mockTestEmbedPort = {};
var mockInstantiatedWorkers = {};
var mockInstantiatedEmbeds = {};
var originalDocument = {
  querySelector: document.querySelector,
  querySelectorAll: document.querySelectorAll,
  createElement: document.createElement
};

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

function mockEmbed(name, cmdPorts, subPorts) {
  mockInstantiatedEmbeds[name] = mockInstantiatedApp(cmdPorts, subPorts);

  mockElm[name] = {
    App: {
      embed: jest.fn(() => mockInstantiatedEmbeds[name])
    }
  };
}

function port(portName) {
  return mockInstantiatedWorkers.ElmRouter.ports[portName].subscribe.mock.calls[0][0];
}

function testCmd() {
  console.log('testCmd ran');
}

function testEmbedCmd() {
  console.log('testEmbedCmd ran');
}

describe('elm-router', () => {
  afterAll(() => {
    document.querySelector = originalDocument.querySelector;
    document.querySelectorAll = originalDocument.querySelectorAll;
    document.createElement = originalDocument.createElement;
  });

  function resetMocks() {
    mockTestPort = {
      register: ports => {
        ports.testCmd.subscribe(testCmd);
      },
      samplePortName: 'testCmd'
    };

    mockTestEmbedPort = {
      register: ports => {
        ports.testEmbedCmd.subscribe(testEmbedCmd);
      },
      samplePortName: 'testEmbedCmd'
    };

    mockInstantiatedWorkers = {};
    mockPorts = [
      mockTestPort,
      mockTestEmbedPort
    ];

    mockWorker('ElmRouter', [
      'routerWorker',
      'routerEmbed',
      'routerEmbedMany',
      'routerLog',
      'routerBroadcastUrlUpdate'
    ], [
      'routerReceiveCmd'
    ]);
  }

  beforeEach(() => {
    resetMocks();
    mockWorker('TestWorker', ['testCmd'], ['testSub', 'urlUpdate']);
    mockEmbed('TestEmbeddableApp', ['testEmbedCmd'], ['testEmbedSub', 'urlUpdate']);
    elmRouter.start(mockElm, mockPorts);
  });

  describe('start', () => {
    test('launches the ElmRouter app', () => {
      expect(mockElm.ElmRouter.App.worker).toHaveBeenCalledWith(undefined); // Called with no flags
    });

    test('throws an Error if `register` was not defined on any port modules', () => {
      resetMocks();

      expect(() => {
        elmRouter.start(mockElm, [{
          notRegister: function() {},
          samplePortName: 'foo'
        }]);
      }).toThrow();
    });

    test('throws an Error if `samplePortName` was not defined on any port modules', () => {
      resetMocks();

      expect(() => {
        elmRouter.start(mockElm, [{
          register: function() {},
          notSamplePortName: 'foo'
        }]);
      }).toThrow();
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
      expect(mockInstantiatedWorkers.TestWorker.ports.testCmd.subscribe)
        .toHaveBeenCalledWith(testCmd);
    });

    test('throws an Error if the given app does not exist', () => {
      expect(() => {
        port('routerWorker')(['NotAnApp']);
      }).toThrow();
    });
  });

  describe('routerEmbed', () => {
    let mockDomNode = {};

    test('embeds an Html app if it exists', () => {
      document.querySelector = jest.fn(() => mockDomNode);
      port('routerEmbed')(['TestEmbeddableApp', '#app_container']);

      expect(mockElm.TestEmbeddableApp.App.embed)
        .toHaveBeenCalledWith(mockDomNode, undefined); // Called with no flags
    });

    test('registers ports for the embedded app', () => {
      document.querySelector = jest.fn(() => mockDomNode);
      port('routerEmbed')(['TestEmbeddableApp', '#app_container']);

      expect(mockInstantiatedEmbeds.TestEmbeddableApp.ports.testEmbedCmd.subscribe)
        .toHaveBeenCalledWith(testEmbedCmd);
    });

    test('throws an Error if the given app does not exist', () => {
      document.querySelector = jest.fn(() => mockDomNode);

      expect(() => {
        port('routerEmbed')(['NotAnApp', '#app_container']);
      }).toThrow();
    });

    test('throws an Error if a DOM node is not found matching the selector', () => {
      document.querySelector = jest.fn(() => null);

      expect(() => {
        port('routerEmbed')(['TestEmbeddableApp', '#app_container']);
      }).toThrow();
    });
  });

  describe('routerEmbedMany', () => {
    let mockDomNode1 = {};
    let mockDomNode2 = {};

    test('embeds an Html app in each of the dom nodes matching the selector', () => {
      document.querySelectorAll = jest.fn(() => [mockDomNode1, mockDomNode2]);

      port('routerEmbedMany')(['TestEmbeddableApp', '.numerous_app_container']);

      expect(mockElm.TestEmbeddableApp.App.embed)
        .toHaveBeenCalledWith(mockDomNode1, undefined); // Called with no flags

      expect(mockElm.TestEmbeddableApp.App.embed)
        .toHaveBeenCalledWith(mockDomNode2, undefined); // Called with no flags
    });

    test('registers ports for each of the embedded apps', () => {
      document.querySelectorAll = jest.fn(() => [mockDomNode1, mockDomNode2]);

      port('routerEmbedMany')(['TestEmbeddableApp', '.numerous_app_container']);

      expect(mockInstantiatedEmbeds.TestEmbeddableApp.ports.testEmbedCmd.subscribe)
        .toHaveBeenCalledWith(testEmbedCmd);

      expect(mockInstantiatedEmbeds.TestEmbeddableApp.ports.testEmbedCmd.subscribe)
        .toHaveBeenCalledTimes(2);
    });

    test('passes flags to each of the embedded apps', () => {
      document.querySelectorAll = jest.fn(() => [mockDomNode1, mockDomNode2]);

      port('routerEmbedMany')(['TestEmbeddableApp', '.numerous_app_container', {foo: "bar"}]);

      expect(mockElm.TestEmbeddableApp.App.embed)
        .toHaveBeenCalledWith(mockDomNode1, {foo: "bar"});

      expect(mockElm.TestEmbeddableApp.App.embed)
        .toHaveBeenCalledWith(mockDomNode2, {foo: "bar"});
    });

    test('throws an Error if the given app does not exist', () => {
      document.querySelectorAll = jest.fn(() => mockDomNode);

      expect(() => {
        port('routerEmbedMany')(['NotAnApp', '.numerous_app_container']);
      }).toThrow();
    });

    test('throws an Error if no DOM nodes are not found matching the selector', () => {
      document.querySelectorAll = jest.fn(() => []);

      expect(() => {
        port('routerEmbedMany')(['TestEmbeddableApp', '.numerous_app_container']);
      }).toThrow();
    });
  });

  describe('routerBroadcastUrlUpdate', () => {
    beforeEach(() => {
      document.querySelector = jest.fn(() => ({}));
      port('routerWorker')(['TestWorker']);
      port('routerEmbed')(['TestEmbeddableApp', '#app_container']);
    });

    test('send an urlUpdate port message to all live Elm apps with `urlUpdate`', () => {
      const mockLocation = {
        href: "http://domain.com/foo/bar?baz=qux",
        host: "domain.com",
        hostname: "domain.com",
        protocol: "http",
        origin: "http://domain.com",
        port_: "",
        pathname: "/foo/bar",
        search: "?baz=qux",
        hash: "",
        username: "",
        password: ""
      };

      port('routerBroadcastUrlUpdate')(mockLocation);

      expect(mockInstantiatedEmbeds.TestEmbeddableApp.ports.urlUpdate.send)
        .toHaveBeenCalledWith(mockLocation);

      expect(mockInstantiatedWorkers.TestWorker.ports.urlUpdate.send)
        .toHaveBeenCalledWith(mockLocation);
    });

    test('defaults `username`, `password`, and `origin` to an empty string if undefined/falsy (IE10 issue)', () => {
      const mockLocation = {
        href: "http://domain.com/foo/bar?baz=qux",
        host: "domain.com",
        hostname: "domain.com",
        protocol: "http",
        origin: undefined,
        port_: "",
        pathname: "/foo/bar",
        search: "?baz=qux",
        hash: "",
        username: undefined,
        password: undefined
      };

      port('routerBroadcastUrlUpdate')(mockLocation);

      expect(mockInstantiatedEmbeds.TestEmbeddableApp.ports.urlUpdate.send)
        .toHaveBeenCalledWith({
          href: "http://domain.com/foo/bar?baz=qux",
          host: "domain.com",
          hostname: "domain.com",
          protocol: "http",
          origin: "",
          port_: "",
          pathname: "/foo/bar",
          search: "?baz=qux",
          hash: "",
          username: "",
          password: ""
        });

      expect(mockInstantiatedWorkers.TestWorker.ports.urlUpdate.send)
        .toHaveBeenCalledWith({
          href: "http://domain.com/foo/bar?baz=qux",
          host: "domain.com",
          hostname: "domain.com",
          protocol: "http",
          origin: "",
          port_: "",
          pathname: "/foo/bar",
          search: "?baz=qux",
          hash: "",
          username: "",
          password: ""
        });
    });
  });
});
