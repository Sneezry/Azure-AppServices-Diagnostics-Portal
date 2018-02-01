﻿using Diagnostics.Scripts;
using Diagnostics.Scripts.Models;
using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.IO;
using System.Text;
using Xunit;

namespace Diagnostics.Tests.ScriptsTests
{
    public class EntityInvokerTests
    {
        [Fact]
        public async void EntityInvoker_TestInvokeMethod()
        {
            using (EntityInvoker invoker = new EntityInvoker(ScriptTestDataHelper.GetRandomMetadata(), ImmutableArray.Create<string>()))
            {
                int par = 3;
                await invoker.InitializeEntryPointAsync();
                object[] args = new object[] { par };
                int result = (int)await invoker.Invoke(args);
                Assert.Equal(9, result);
            }
        }

        [Theory]
        [InlineData(ScriptErrorType.CompilationError)]
        [InlineData(ScriptErrorType.DuplicateEntryPoint)]
        [InlineData(ScriptErrorType.MissingEntryPoint)]
        public async void EntityInvoker_TestInvokeWithCompilationError(ScriptErrorType errorType)
        {
            EntityMetadata metadata = ScriptTestDataHelper.GetRandomMetadata();
            metadata.scriptText = ScriptTestDataHelper.GetInvalidCsxScript(errorType);

            using (EntityInvoker invoker = new EntityInvoker(metadata, ImmutableArray.Create<string>()))
            {
                await Assert.ThrowsAsync<ScriptCompilationException>(async () =>
                {
                    await invoker.InitializeEntryPointAsync();
                    int result = (int)await invoker.Invoke(new object[] { 3 });
                    Assert.Equal(9, result);
                });
            }
        }
    }
}
