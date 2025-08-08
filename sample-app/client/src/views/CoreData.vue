<template>
  <AppLayoutWrapper>
    <div class="core-data-container">
      <!-- Page Header -->
      <div class="page-header mb-4">
        <div class="row align-items-center">
          <div class="col">
            <h1 class="h3 mb-0">Core Data Management</h1>
            <p class="text-muted mb-0">
              Manage and view data from the FDE Engine
            </p>
          </div>
          <div class="col-auto">
            <div class="btn-group">
              <button
                v-for="tab in tabs"
                :key="tab.key"
                class="btn"
                :class="
                  activeTab === tab.key ? 'btn-primary' : 'btn-outline-primary'
                "
                @click="activeTab = tab.key"
              >
                <i :class="tab.icon" class="me-2"></i>
                {{ tab.label }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="container-fluid">
        <!-- Decisions Tab -->
        <div v-if="activeTab === 'decisions'" class="tab-content">
          <DataTable
            title="Decisions"
            subtitle="Application decision records from the FDE Engine"
            api-endpoint="/api/core/decisions"
            :columns="decisionColumns"
            :available-filters="decisionFilters"
            @view-item="viewDecision"
            @edit-item="editDecision"
          />
        </div>

        <!-- Documents Tab -->
        <div v-if="activeTab === 'documents'" class="tab-content">
          <DataTable
            title="Documents"
            subtitle="Document validation and processing records"
            api-endpoint="/api/core/documents"
            :columns="documentColumns"
            :available-filters="documentFilters"
            @view-item="viewDocument"
            @edit-item="editDocument"
          />
        </div>

        <!-- Events Tab -->
        <div v-if="activeTab === 'events'" class="tab-content">
          <DataTable
            title="Events"
            subtitle="System events and validation activities"
            api-endpoint="/api/core/events"
            :columns="eventColumns"
            :available-filters="eventFilters"
            @view-item="viewEvent"
            @edit-item="editEvent"
          />
        </div>

        <!-- Errors Tab -->
        <div v-if="activeTab === 'errors'" class="tab-content">
          <DataTable
            title="Errors"
            subtitle="System errors and processing failures"
            api-endpoint="/api/core/errors"
            :columns="errorColumns"
            :available-filters="errorFilters"
            @view-item="viewError"
            @edit-item="editError"
          />
        </div>

        <!-- Blacklist Tab -->
        <div v-if="activeTab === 'blacklist'" class="tab-content">
          <DataTable
            title="Blacklist"
            subtitle="Blacklisted entities and security violations"
            api-endpoint="/api/core/blacklist"
            :columns="blacklistColumns"
            :available-filters="blacklistFilters"
            @view-item="viewBlacklist"
            @edit-item="editBlacklist"
          />
        </div>

        <!-- Security Violations Tab -->
        <div v-if="activeTab === 'security-violations'" class="tab-content">
          <DataTable
            title="Security Violations"
            subtitle="Security violations and compliance issues"
            api-endpoint="/api/core/security-violations"
            :columns="securityViolationColumns"
            :available-filters="securityViolationFilters"
            @view-item="viewSecurityViolation"
            @edit-item="editSecurityViolation"
          />
        </div>

        <!-- Retro Reviews Tab -->
        <div v-if="activeTab === 'retro-reviews'" class="tab-content">
          <DataTable
            title="Retro Reviews"
            subtitle="Retrospective review activities"
            api-endpoint="/api/core/retro-reviews"
            :columns="retroReviewColumns"
            :available-filters="retroReviewFilters"
            @view-item="viewRetroReview"
            @edit-item="editRetroReview"
          />
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div 
      v-if="selectedItem" 
      class="modal fade show" 
      id="detailModal" 
      tabindex="-1"
      style="display: block;"
      @click.self="closeModal"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ detailModalTitle }}</h5>
            <button
              type="button"
              class="btn-close"
              @click="closeModal"
            ></button>
          </div>
          <div class="modal-body">
            <pre class="bg-light p-3 rounded">{{
              JSON.stringify(selectedItem, null, 2)
            }}</pre>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="closeModal"
            >
              Close
            </button>
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade show"></div>
    </div>
  </AppLayoutWrapper>
</template>

<script>
  import { ref, computed } from 'vue'
  import DataTable from '../components/DataTable.vue'
  import AppLayoutWrapper from '../components/AppLayoutWrapper.vue'

  export default {
    name: 'CoreData',
    components: {
      DataTable,
      AppLayoutWrapper,
    },
    setup() {
      const activeTab = ref('decisions')
      const selectedItem = ref(null)
      const detailModalTitle = ref('')

      // Tab configuration
      const tabs = [
        { key: 'decisions', label: 'Decisions', icon: 'fas fa-gavel' },
        { key: 'documents', label: 'Documents', icon: 'fas fa-file-alt' },
        { key: 'events', label: 'Events', icon: 'fas fa-calendar-alt' },
        { key: 'errors', label: 'Errors', icon: 'fas fa-exclamation-triangle' },
        { key: 'blacklist', label: 'Blacklist', icon: 'fas fa-ban' },
        {
          key: 'security-violations',
          label: 'Security',
          icon: 'fas fa-shield-alt',
        },
        { key: 'retro-reviews', label: 'Reviews', icon: 'fas fa-search' },
      ]

      // Column configurations
      const decisionColumns = [
        { key: 'applicationNumber', label: 'Application #', sortable: true },
        { key: 'fdeReference', label: 'FDE Reference', sortable: true },
        {
          key: 'validation.decision',
          label: 'Decision',
          type: 'status',
          sortable: true,
        },
        { key: 'validation.aggregatedScore', label: 'Score', sortable: true },
        { key: 'createdTime', label: 'Created', type: 'date', sortable: true },
      ]

      const documentColumns = [
        { key: 'documentName', label: 'Document Name', sortable: true },
        { key: 'documentType', label: 'Type', sortable: true },
        {
          key: 'fraudulentDocumentStatus',
          label: 'Fraudulent',
          type: 'boolean',
          sortable: true,
        },
        {
          key: 'fillableCheckStatus',
          label: 'Fillable',
          type: 'boolean',
          sortable: true,
        },
        { key: 'createdAt', label: 'Created', type: 'date', sortable: true },
      ]

      const eventColumns = [
        { key: 'eventType', label: 'Event Type', sortable: true },
        { key: 'eventSource', label: 'Source', sortable: true },
        { key: 'eventStatus', label: 'Status', type: 'status', sortable: true },
        { key: 'createdAt', label: 'Created', type: 'date', sortable: true },
      ]

      const errorColumns = [
        { key: 'errorType', label: 'Error Type', sortable: true },
        { key: 'errorMessage', label: 'Message', sortable: true },
        { key: 'errorStatus', label: 'Status', type: 'status', sortable: true },
        { key: 'createdAt', label: 'Created', type: 'date', sortable: true },
      ]

      const blacklistColumns = [
        { key: 'entityType', label: 'Entity Type', sortable: true },
        { key: 'entityValue', label: 'Entity Value', sortable: true },
        { key: 'blacklistStatus', label: 'Status', type: 'status', sortable: true },
        { key: 'createdAt', label: 'Created', type: 'date', sortable: true },
      ]

      const securityViolationColumns = [
        { key: 'violationType', label: 'Violation Type', sortable: true },
        { key: 'severity', label: 'Severity', sortable: true },
        { key: 'violationStatus', label: 'Status', type: 'status', sortable: true },
        { key: 'createdAt', label: 'Created', type: 'date', sortable: true },
      ]

      const retroReviewColumns = [
        { key: 'reviewType', label: 'Review Type', sortable: true },
        { key: 'reviewStatus', label: 'Status', type: 'status', sortable: true },
        { key: 'reviewDate', label: 'Review Date', type: 'date', sortable: true },
        { key: 'createdAt', label: 'Created', type: 'date', sortable: true },
      ]

      // Filter configurations
      const decisionFilters = [
        { key: 'applicationNumber', label: 'Application Number' },
        { key: 'fdeReference', label: 'FDE Reference' },
        { key: 'validation.decision', label: 'Decision' },
      ]

      const documentFilters = [
        { key: 'documentName', label: 'Document Name' },
        { key: 'documentType', label: 'Document Type' },
        { key: 'fraudulentDocumentStatus', label: 'Fraudulent Status' },
      ]

      const eventFilters = [
        { key: 'eventType', label: 'Event Type' },
        { key: 'eventSource', label: 'Event Source' },
        { key: 'eventStatus', label: 'Event Status' },
      ]

      const errorFilters = [
        { key: 'errorType', label: 'Error Type' },
        { key: 'errorStatus', label: 'Error Status' },
      ]

      const blacklistFilters = [
        { key: 'entityType', label: 'Entity Type' },
        { key: 'blacklistStatus', label: 'Blacklist Status' },
      ]

      const securityViolationFilters = [
        { key: 'violationType', label: 'Violation Type' },
        { key: 'severity', label: 'Severity' },
      ]

      const retroReviewFilters = [
        { key: 'reviewStatus', label: 'Review Status' },
        { key: 'reviewType', label: 'Review Type' },
      ]

      // View/Edit handlers
      const showDetailModal = (item, title) => {
        selectedItem.value = item
        detailModalTitle.value = title
        // Add escape key handler
        const handleEscape = (event) => {
          if (event.key === 'Escape') {
            closeModal()
          }
        }
        document.addEventListener('keydown', handleEscape)
        // Store cleanup function
        selectedItem.value._cleanup = () => {
          document.removeEventListener('keydown', handleEscape)
        }
      }

      const viewDecision = item => {
        showDetailModal(item, 'Decision Details')
      }

      const editDecision = item => {
        showDetailModal(item, 'Edit Decision')
      }

      const viewDocument = item => {
        showDetailModal(item, 'Document Details')
      }

      const editDocument = item => {
        showDetailModal(item, 'Edit Document')
      }

      const viewEvent = item => {
        showDetailModal(item, 'Event Details')
      }

      const editEvent = item => {
        showDetailModal(item, 'Edit Event')
      }

      const viewError = item => {
        showDetailModal(item, 'Error Details')
      }

      const editError = item => {
        showDetailModal(item, 'Edit Error')
      }

      const viewBlacklist = item => {
        showDetailModal(item, 'Blacklist Details')
      }

      const editBlacklist = item => {
        showDetailModal(item, 'Edit Blacklist')
      }

      const viewSecurityViolation = item => {
        showDetailModal(item, 'Security Violation Details')
      }

      const editSecurityViolation = item => {
        showDetailModal(item, 'Edit Security Violation')
      }

      const viewRetroReview = item => {
        showDetailModal(item, 'Retro Review Details')
      }

      const editRetroReview = item => {
        showDetailModal(item, 'Edit Retro Review')
      }

      const closeModal = () => {
        // Clean up event listeners
        if (selectedItem.value && selectedItem.value._cleanup) {
          selectedItem.value._cleanup()
        }
        selectedItem.value = null
        detailModalTitle.value = ''
      }

      return {
        activeTab,
        tabs,
        selectedItem,
        detailModalTitle,
        decisionColumns,
        documentColumns,
        eventColumns,
        errorColumns,
        blacklistColumns,
        securityViolationColumns,
        retroReviewColumns,
        decisionFilters,
        documentFilters,
        eventFilters,
        errorFilters,
        blacklistFilters,
        securityViolationFilters,
        retroReviewFilters,
        viewDecision,
        editDecision,
        viewDocument,
        editDocument,
        viewEvent,
        editEvent,
        viewError,
        editError,
        viewBlacklist,
        editBlacklist,
        viewSecurityViolation,
        editSecurityViolation,
        viewRetroReview,
        editRetroReview,
        closeModal,
      }
    },
  }
</script>

<style scoped>
  .core-data-container {
    background-color: #f8f9fa;
  }

  .tab-content {
    margin-top: 1rem;
  }

  .btn-group .btn {
    border-radius: 0;
  }

  .btn-group .btn:first-child {
    border-top-left-radius: 0.375rem;
    border-bottom-left-radius: 0.375rem;
  }

  .btn-group .btn:last-child {
    border-top-right-radius: 0.375rem;
    border-bottom-right-radius: 0.375rem;
  }

  .modal-body pre {
    max-height: 400px;
    overflow-y: auto;
    font-size: 0.875rem;
  }

  /* Ensure modal is properly positioned */
  .modal.show {
    display: block !important;
    background-color: rgba(0, 0, 0, 0.5);
  }

  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1040;
  }

  .modal {
    z-index: 1050;
  }
</style>
