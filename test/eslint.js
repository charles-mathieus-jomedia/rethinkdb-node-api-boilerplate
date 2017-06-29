'use strict'

const colors = require('colors')

expect.extend({
  /**
   * Expect ESLint results to have no errors
   * @param {*} received ESLint results
   * @param {*} argument Arguments
   * @returns {object} Matcher result
   */
  toESLint (received, argument) {
    // Check if we received something & if it containes errors or warnings
    if (received && (received.errorCount > 0 || received.warningCount > 0)) {
      const outputBuffer = []

      // Loop the results
      for (let i = 0; i < received.results.length; i++) {
        const result = received.results[i]

        // Make sure we have errors or warnings
        if (result.errorCount <= 0 && result.warningCount <= 0) {
          continue
        }

        // Show the file
        outputBuffer.push(`${colors.grey('└──')} ${result.filePath}`)

        for (let x = 0; x < result.messages.length; x++) {
          const m = result.messages[x]
          const message = m.message
          const suffix = colors.grey(m.line + ':' + m.column)
          const prefix = (m.severity === 1) ? colors.yellow('Warning:') : colors.red('Error:')

          outputBuffer.push(`    ${prefix} ${message} ${suffix}`)
        }

        outputBuffer.push('\n')
      }

      outputBuffer.push('')
      outputBuffer.push(`Error Count: ${colors.red(received.errorCount)}`)
      outputBuffer.push(`Warning Count: ${colors.yellow(received.warningCount)}`)

      const pass = received.errorCount === 0

      if (outputBuffer.length > 0) {
        return {
          message: () => (outputBuffer.join(`\n`)),
          pass
        }
      }
    }

    return {
      pass: true
    }
  }
})

describe('Code Linting', () => {
  it('should pass ESLint validation', () => {
    const CLIEngine = require('eslint').CLIEngine
    const cli = new CLIEngine()
    const report = cli.executeOnFiles([
      'src/**/*.js',
      'test/**/*.js',
      '*.js'
    ])
    expect(report).toESLint()
  })
})
