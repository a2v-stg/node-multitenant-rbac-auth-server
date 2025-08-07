<template>
  <div class="container mt-4">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h3>FDE Engine Integration</h3>
          </div>
          <div class="card-body">
            <p>This page demonstrates the integration with the FDE Engine from the sample-app.</p>
            
            <div class="alert alert-success" v-if="engineStatus">
              <h5>FDE Engine Status: {{ engineStatus }}</h5>
            </div>

            <div class="row mt-4">
              <div class="col-md-6">
                <div class="card">
                  <div class="card-header">
                    <h5>FDE Engine Features</h5>
                  </div>
                  <div class="card-body">
                    <p>The FDE Engine provides:</p>
                    <ul>
                      <li>Document processing</li>
                      <li>Fraud detection</li>
                      <li>Risk assessment</li>
                      <li>API endpoints</li>
                      <li>Event handling</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div class="col-md-6">
                <div class="card">
                  <div class="card-header">
                    <h5>Integration Points</h5>
                  </div>
                  <div class="card-body">
                    <p>How the sample app integrates with FDE Engine:</p>
                    <ul>
                      <li>Shared database models</li>
                      <li>API communication</li>
                      <li>Event processing</li>
                      <li>User authentication</li>
                      <li>Tenant isolation</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-4">
              <button @click="checkEngineStatus" class="btn btn-primary">
                Check Engine Status
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FDEEngine',
  data() {
    return {
      engineStatus: null
    }
  },
  methods: {
    async checkEngineStatus() {
      try {
        const response = await this.$http.get('/api/fde-engine')
        this.engineStatus = response.data.engine
      } catch (error) {
        console.error('Error checking engine status:', error)
        this.engineStatus = 'Error'
      }
    }
  },
  mounted() {
    this.checkEngineStatus()
  }
}
</script>

<style scoped>
.card {
  margin-bottom: 1rem;
}
</style> 