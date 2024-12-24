const autocannon = require('autocannon');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

class PerformanceTestSuite {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.resultsDir = path.join(__dirname, 'results');
    
    // Créer le dossier de résultats s'il n'existe pas
    if (!fs.existsSync(this.resultsDir)) {
      fs.mkdirSync(this.resultsDir);
    }
  }

  // Test de charge standard
  async standardLoadTest() {
    const instance = autocannon({
      url: `${this.baseUrl}/api/products`,
      connections: 100,
      duration: 60,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      requests: [
        {
          method: 'GET',
          path: '/api/products',
          body: null
        }
      ]
    });

    const results = await promisify(autocannon.track)(instance);
    this._saveResults('standard_load_test', results);
    return results;
  }

  // Test de charge avec pics de trafic
  async peakTrafficTest() {
    const instance = autocannon({
      url: `${this.baseUrl}/api/products`,
      connections: 500,
      duration: 30,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      requests: [
        {
          method: 'GET',
          path: '/api/products',
          body: null
        }
      ]
    });

    const results = await promisify(autocannon.track)(instance);
    this._saveResults('peak_traffic_test', results);
    return results;
  }

  // Test de charge pour les opérations complexes
  async complexOperationTest() {
    const instance = autocannon({
      url: `${this.baseUrl}/api/recommendations`,
      connections: 200,
      duration: 45,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      requests: [
        {
          method: 'POST',
          path: '/api/recommendations',
          body: JSON.stringify({
            userId: 'test_user',
            context: 'product_browsing'
          })
        }
      ]
    });

    const results = await promisify(autocannon.track)(instance);
    this._saveResults('complex_operation_test', results);
    return results;
  }

  // Sauvegarde des résultats
  _saveResults(testName, results) {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filename = `${testName}_${timestamp}.json`;
    const filepath = path.join(this.resultsDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(results, null, 2));
    console.log(`Résultats du test ${testName} sauvegardés dans ${filename}`);
  }

  // Analyse comparative des performances
  async runComprehensiveTests() {
    console.log('🚀 Démarrage des tests de performance complets');

    const standardTest = await this.standardLoadTest();
    const peakTest = await this.peakTrafficTest();
    const complexTest = await this.complexOperationTest();

    const analysis = {
      standardLoad: {
        requestsPerSecond: standardTest.requests.average,
        latency: standardTest.latency.average,
        statusCodes: standardTest.statusCodeStats
      },
      peakTraffic: {
        requestsPerSecond: peakTest.requests.average,
        latency: peakTest.latency.average,
        statusCodes: peakTest.statusCodeStats
      },
      complexOperations: {
        requestsPerSecond: complexTest.requests.average,
        latency: complexTest.latency.average,
        statusCodes: complexTest.statusCodeStats
      }
    };

    // Génération d'un rapport détaillé
    this._generatePerformanceReport(analysis);

    return analysis;
  }

  // Génération de rapport de performance
  _generatePerformanceReport(analysis) {
    const reportPath = path.join(this.resultsDir, 'performance_report.md');
    const reportContent = `
# 📊 Rapport de Performance Chicha Store

## Résumé Exécutif
- **Date**: ${new Date().toISOString()}
- **Environnement**: Production

## Tests de Charge

### Test de Charge Standard
- Requêtes/sec: ${analysis.standardLoad.requestsPerSecond}
- Latence moyenne: ${analysis.standardLoad.latency}ms
- Codes de statut: ${JSON.stringify(analysis.standardLoad.statusCodes)}

### Test de Charge de Pic
- Requêtes/sec: ${analysis.peakTraffic.requestsPerSecond}
- Latence moyenne: ${analysis.peakTraffic.latency}ms
- Codes de statut: ${JSON.stringify(analysis.peakTraffic.statusCodes)}

### Test d'Opérations Complexes
- Requêtes/sec: ${analysis.complexOperations.requestsPerSecond}
- Latence moyenne: ${analysis.complexOperations.latency}ms
- Codes de statut: ${JSON.stringify(analysis.complexOperations.statusCodes)}

## Recommandations
1. Optimiser les requêtes à forte latence
2. Mettre à l'échelle les ressources pour les pics de trafic
3. Améliorer la gestion des opérations complexes
`;

    fs.writeFileSync(reportPath, reportContent);
    console.log('📄 Rapport de performance généré');
  }
}

module.exports = PerformanceTestSuite;
