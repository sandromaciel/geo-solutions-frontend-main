// Karma configuration file
module.exports = function (config) {
  config.set({
    basePath: "", // A pasta base a partir da qual os arquivos serão resolvidos
    frameworks: ["jasmine", "@angular-devkit/build-angular"], // Frameworks de teste utilizados
    plugins: [
      require("karma-jasmine"), // Plugin do Jasmine
      require("karma-chrome-launcher"), // Plugin para lançar o Chrome
      require("karma-jasmine-html-reporter"), // Reporter HTML do Jasmine
      require("karma-coverage"), // Plugin para relatórios de cobertura de código
      require("@angular-devkit/build-angular/plugins/karma"), // Plugin Angular
    ],
    client: {
      clearContext: false, // Deixa o output do Jasmine visível na UI
      jasmine: {
        timeoutInterval: 10000, // Tempo máximo para cada teste (10 segundos)
        random: false, // Desativa a execução aleatória para facilitar debugging
      },
    },
    coverageReporter: {
      dir: require("path").join(__dirname, "./coverage"), // Pasta onde os relatórios de cobertura serão salvos
      subdir: ".",
      reporters: [
        { type: "html" }, // Gera relatório HTML detalhado
        { type: "text-summary" }, // Gera resumo em texto
        { type: "lcov" }, // Formato para ferramentas como o SonarQube
      ],
      fixWebpackSourcePaths: true,
    },
    reporters: ["progress", "kjhtml"], // Reporters utilizados durante a execução
    port: 9876, // Porta utilizada pelo servidor Karma
    colors: true, // Habilita cores no output do terminal
    logLevel: config.LOG_INFO, // Nível de logging
    autoWatch: true, // Observa alterações nos arquivos
    browsers: ["Chrome"], // Navegadores para executar os testes
    customLaunchers: {
      ChromeHeadlessCI: {
        base: "ChromeHeadless",
        flags: ["--no-sandbox", "--disable-gpu"],
      },
    },
    singleRun: false, // Se verdadeiro, os testes serão executados uma vez e o processo terminará
    restartOnFileChange: true, // Reinicia o servidor quando os arquivos são alterados
    failOnEmptyTestSuite: false, // Não falha se não houver testes
    files: [
      {
        pattern:
          "./node_modules/primeng/resources/themes/lara-light-blue/theme.css",
        included: true,
        watched: false,
      },
      {
        pattern: "./node_modules/primeng/resources/primeng.min.css",
        included: true,
        watched: false,
      },
      {
        pattern: "./node_modules/primeicons/primeicons.css",
        included: true,
        watched: false,
      },
    ],
  });
};
