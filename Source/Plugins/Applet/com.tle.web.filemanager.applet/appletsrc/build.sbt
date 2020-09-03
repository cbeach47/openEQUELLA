val springVersion = "5.2.8.RELEASE"

libraryDependencies ++= Seq(
  "com.google.guava"         % "guava"           % "18.0",
  "com.github.insubstantial" % "flamingo"        % "7.3",
  "com.miglayout"            % "miglayout-swing" % "4.2",
  "org.springframework"      % "spring-web"      % springVersion,
  "org.springframework"      % "spring-aop"      % springVersion
)

// TODO ^^^ tried added it for Spring 5 review of 'remoting' package.
//  "org.springframework.security" % "spring-security-core" % "5.3.4.RELEASE"
//
dependsOn(platformSwing, LocalProject("com_tle_common_applet"))

packageOptions in assembly += Package.ManifestAttributes(
  "Application-Name"                       -> "EQUELLA File Manager",
  "Permissions"                            -> "all-permissions",
  "Codebase"                               -> "*",
  "Application-Library-Allowable-Codebase" -> "*",
  "Caller-Allowable-Codebase"              -> "*"
)

assemblyOption in assembly := (assemblyOption in assembly).value.copy(includeScala = false)

assemblyMergeStrategy in assembly := {
  case x if x.contains("overview.html") => MergeStrategy.first
  case x =>
    val oldStrategy = (assemblyMergeStrategy in assembly).value
    oldStrategy(x)
}
