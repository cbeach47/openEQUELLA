# Contributing

:+1::tada: First off, thanks for taking the time to contribute! :tada::+1:

We welcome contributions via both the raising of issues and submitting pull requests. But before you
do, please take a moment to consult the below.

## Chatting

If before any of the below you'd like to discuss an issue or some code, then come and chat with
us on one of the following platforms:

- [Users mailing list](https://groups.google.com/a/apereo.org/forum/#!forum/equella-users) - Most
  active, best for more usage centric questions
- [Developer mailing list](https://groups.google.com/a/apereo.org/forum/#!forum/equella-dev) - For
  discussing work on the code
- \#Equella channel in [Apereo's slack](https://apereo.slack.com/)

## Submitting Issues

When you submit an issue, please take the time to provide as much info as you can. Key bits are:

1. What operating system
2. What Java version
3. What browser version
4. A concise description of your issue
5. More details of the issue, including any error logs etc.

## Contributing Code / Pull Requests

As per standard Apereo projects: If you wish to contribute to openEQUELLA itself, you should first
subscribe to the openEQUELLA Google Group as outlined above and discuss your contributions with
the other developers. You will also need to sign a
[Contributor License Agreement](https://www.apereo.org/node/676).

But after that, as per usual GitHub, please first fork the project and then branch off `develop` or a
stable branch (see below) to use a 'feature' branch. Branches should follow the naming convention of:

    feature/<issue#>-<short_desc>

Or if for a bug, you can choose to:

    bugfix/<issue#>-<short_desc>

For example:

    feature/123-make_coffee

or:

    bugfix/124-fix_burnt_coffee

If you're unsure which to use, default to using `feature/<issue#>-<short_desc>`.

Please ensure you provide [quality commit messages](https://chris.beams.io/posts/git-commit/),
and in the PR please detail what testing you have undertaken. Also, ideally provide some tests as
part of your PR and/or details of any manual tests you performed.

### Git Workflow and Layout

The project is mostly aligned with the [Git Flow
workflow](https://nvie.com/posts/a-successful-git-branching-model/). Each new piece of work has a
new branch created. Code reviews/PRs then take place on this branch, which on completion are merged
back to `develop`.

There are a number of Git tools which provide Git Flow tooling. Most dedicated Git GUI's provide
support (such as SourceTree and GitKraken), but perhaps the simplest approach (assuming you're
comfortable with the Git CLI) is to install the [gitflow git
extension](https://github.com/nvie/gitflow). Most linux distributions provide a package to install
this (recommended).

With Git Flow this essentially means our `develop` branch is our unstable branch where we're working
towards the next version. And `master` is our currently stable branch. We also have historically
stable branches which we use for back porting and have the name format of `stable-<version>` -
e.g. `stable-6.6`.

Historically some branches did not follow that format, so if you're looking for an older
version:

| Version | Branch       |
| ------- | ------------ |
| 6.6     | `stable-6.6` |
| 6.5     | `stable`     |
| 6.4     | `6.4`        |

Subsequent revision releases are done from the matching stable branches. And if suitable,
fixes are merged to other versions - and especially to `master`.

NOTE: There are problems with building 6.4 as it still has references to the old commercial build
environment. Effort was undertaken in 6.5 to remove these linkages.

## Setting up a development environment

Note: There are a couple of changes to the build process, and some discussion on Scala / Java and
the frontend that should be understood when working on openEQUELLA code - please take a look at this
[Google Group
thread](https://groups.google.com/a/apereo.org/forum/#!topic/equella-users/bLV_XXQFOTI) and this
[issue ticket](https://github.com/openequella/openEQUELLA/issues/437). This page will be updated once the
React UI code is a bit more solidified.

### IDE

The source isn't tied to a particular IDE, so it should be buildable
with any IDE which has an SBT integration. Having said that IntelliJ is
what most developers are using.

#### IntelliJ - latest

Import as an SBT project and use the default settings.

If you get compile errors in the IDE, but standalone `sbt compile` works, do an sbt refresh from the
IntelliJ `SBT tool window`.

#### Eclipse - Scala IDE 4.6

You must use the [sbteclipse](https://github.com/typesafehub/sbteclipse) plug-in to write projects
out Eclipse projects and you must configure it with the following settings:

```sbtshell
import com.typesafe.sbteclipse.plugin.EclipsePlugin._

EclipseKeys.withBundledScalaContainers := false
EclipseKeys.createSrc := EclipseCreateSrc.Default + EclipseCreateSrc.ManagedClasses
EclipseKeys.eclipseOutput := Some("target/scala-2.11/classes/")
```

#### Code Formatters

All code should be formatted using the following formatting tools:

- Scala - [scalafmt](https://scalameta.org/scalafmt/)
- Java - [Google Java Format](https://github.com/google/google-java-format)
- Typescript/JS/Markdown/YAML + more... - [Prettier](https://prettier.io/)

Each formatter has various IDE plugins, in particular IntelliJ is well supported:

- [Google Java Format](https://plugins.jetbrains.com/plugin/8527-google-java-format)
- scalafmt is built in
- [Prettier](https://plugins.jetbrains.com/plugin/10456-prettier)

#### Pre-commit hook

openEQUELLA provides [a script to set up git pre-commit hooks](https://github.com/typicode/husky) to [format the code](#code-formatters) you have [modified before committing](https://github.com/okonet/lint-staged).
To set it up you must run the installer once (from the root dir):

```bash
npm install
```

#### Create dev configuration settings

openEQUELLA requires a configuration folder (`learningedge-config`) in order to start and there
is an sbt task which will generate configuration files suitable for running with your dev environment:

```bash
sbt prepareDevConfig
```

This will create a configuration in the `{openEQUELLA repo}/Dev/learningedge-config` folder which you can
modify for your needs, in particular you will need to configure `hibernate.properties` to point to
the database that you have created for openEQUELLA.

The default admin url will be: `http://localhost:8080/`

#### Updating plugin library jars for dev mode

When running the server in dev mode, the server runner doesn't have access to the SBT build
information, so it can't find the jar libraries which some of the plugins require, so an extra SBT
task is required to copy the jars into a known location for the runner. This task is run by the
`prepareDevConfig` task too.

```bash
~$ sbt jpfWriteDevJars
```

#### Running SBT task to generate non-java resources

When you build openEQUELLA from within IntelliJ, it will only compile Scala/Java sources and copy
resources from the resource folders, it won't run any of the scripts that generate resoureces (such
as compile code to Javascript), in order to do this you can run:

```bash
~$ sbt resources
```

#### Running a dev server

Ensure you have your `Dev/learningedge-config` setup.

```bash
~$ sbt compile equellaserver/run
```

Alternatively you can run the server from your IDE by running the class:

`com.tle.core.equella.runner.EQUELLAServer`

Inside the `Source/Server/equellaserver` project.

Ensure that your runner settings compiles the whole project before running:

- IntelliJ - `Before Launch -> Build Project`

#### Running the admin tool

Ensure you have your server running and know it's

```bash
~$ sbt compile adminTool/run
```

or run `com.tle.client.harness.ClientLauncher` in the `Source/Server/adminTool` project.

#### Developing the JS code

In the `Source/Plugins/Core/com.equella.core/js` directory you will find a yarn/npm
project which compiles Purescript/Typescript/Sass into JS and CSS. Currently there are number
of separate JS bundles which are generated using Parcel. You can use parcel watched mode to
have changes automatically bundled up and reloaded in the browser:

```sh
~/Source/Plugins/Core/com.equella.core/js$ npm run dev
```

This will build the javascript bundles to the correct location for running a dev openEQUELLA and will
watch for source changes and re-build if required.

### SBT Notes

The new build uses SBT (very flexible and has a large set of useful plug-ins available). You can
customize pretty much any aspect of your build process using Scala scripts.

Plug-ins are global to the build but can be turned on/off on a per project basis.

The root build is located in the following files:

- `build.sbt`
- `project/*.scala`
- `project/plugins.sbt`

Located in the "project" folder is a series of SBT AutoPlugins which are responsible for replicating
some of what the ant build used to do:

- `JPFScanPlugin` - scanning for plug-in projects
- `JPFPlugin` - default folder layout and settings for JPF plug-in projects
- `JPFRunnerPlugin` - collecting plug-ins for deployment or running

The root plug-in manually defines the sub-project location and their inter-project dependencies:

- `equellaserver` - contains the server bootstrap code and contains the dependency list for the
  server, produces the upgrade zip
- `InstallerZip` - produces the installer zip
- `UpgradeZip` - produces the upgrade zip
- `UpgradeInstallation` - the installation upgrader which is part of the upgrade zip
- `UpgradeManager` - the upgrade manager web app
- `conversion` - the conversion service
- `allPlugins` - an aggregate project which can be used for building all the JPF plug-ins
- `adminTool` - contains the admin console client launcher

#### Misc

If you get a deduplicate dependencies on commons logging, SLF4J has a moonlighting jar that
says it's commons logging. Use the build.sbt directive of exclude dependencies like the
adminConsole does.
