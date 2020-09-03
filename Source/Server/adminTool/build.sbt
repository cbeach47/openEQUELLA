val springVersion = "5.2.8.RELEASE"

libraryDependencies ++= Seq(
  "org.slf4j"              % "jcl-over-slf4j"  % "1.7.30",
  "org.slf4j"              % "slf4j-api"       % "1.7.30",
  "org.slf4j"              % "slf4j-simple"    % "1.7.30",
  "org.jvnet.hudson"       % "xstream"         % "1.3.1-hudson-8",
  "com.google.guava"       % "guava"           % "18.0",
  "com.github.equella.jpf" % "jpf"             % "1.0.7",
  "com.fifesoft"           % "rsyntaxtextarea" % "1.5.2",
  "com.miglayout"          % "miglayout-swing" % "4.2",
  "org.springframework"    % "spring-web"      % springVersion,
  "org.springframework"    % "spring-aop"      % springVersion
)

unmanagedJars in Compile += file(sys.props("java.home")) / "lib/javaws.jar"

fork in run := true

mainClass in (Compile, run) := Some("com.tle.client.harness.ClientLauncher")
