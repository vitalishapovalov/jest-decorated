const {
  AfterAll,
  AfterEach,
  BeforeAll,
  BeforeEach,
  DataProvider,
  Describe,
  It,
  LazyImport,
  Mock,
  MockFn,
  RunWith,
  Spy,
  Test,
  WithDataProvider,
  DescribeRunner,
  TestRunner,
} = require(".");

global.AfterAll = AfterAll;
global.AfterEach = AfterEach;
global.BeforeAll = BeforeAll;
global.BeforeEach = BeforeEach;
global.DataProvider = DataProvider;
global.Describe = Describe;
global.It = It;
global.LazyImport = LazyImport;
global.Mock = Mock;
global.MockFn = MockFn;
global.RunWith = RunWith;
global.Spy = Spy;
global.Test = Test;
global.WithDataProvider = WithDataProvider;
global.DescribeRunner = DescribeRunner;
global.TestRunner = TestRunner;
