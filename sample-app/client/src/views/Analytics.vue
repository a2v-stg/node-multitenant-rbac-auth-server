<template>
  <div class="container-fluid">
    <div class="row mb-4">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h4>Analytics Dashboard</h4>
            <button @click="$router.push('/dashboard')" class="btn btn-outline-primary btn-sm">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-body text-center">
            <i class="fas fa-chart-line fa-4x text-muted mb-3"></i>
            <h5>Analytics Dashboard</h5>
            <p class="text-muted">This is an app-specific feature built on top of admin-ui</p>
            <p>Here you would implement your custom analytics functionality.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Analytics'
}
</script> 