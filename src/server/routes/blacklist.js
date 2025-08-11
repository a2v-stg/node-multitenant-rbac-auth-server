const express = require('express');
const router = express.Router();

// Get blacklist entities with pagination and search
router.get('/blacklist', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const searchTerm = req.query.searchTerm || '';

    // For now, we'll return mock data
    // In production, this would query your database
    const mockBlacklistItems = [
      {
        _id: '1',
        entityType: 'SSN',
        entityValue: '123-45-6789',
        source: 'Manual',
        createdAt: new Date('2024-01-15')
      },
      {
        _id: '2',
        entityType: 'ACCOUNT_EMAIL',
        entityValue: 'fraud@example.com',
        source: 'System',
        createdAt: new Date('2024-01-10')
      },
      {
        _id: '3',
        entityType: 'ACCOUNT_MOBILE',
        entityValue: '+1-555-123-4567',
        source: 'Manual',
        createdAt: new Date('2024-01-05')
      },
      {
        _id: '4',
        entityType: 'IP_ADDRESS',
        entityValue: '192.168.1.100',
        source: 'BaseProduct',
        createdAt: new Date('2024-01-01')
      }
    ];

    // Filter by search term if provided
    let filteredItems = mockBlacklistItems;
    if (searchTerm) {
      filteredItems = mockBlacklistItems.filter(
        item =>
          item.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.entityValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.source &&
            item.source.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Calculate pagination
    const totalBlackListEntities = filteredItems.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedItems = filteredItems.slice(startIndex, endIndex);

    res.json({
      blackListItems: paginatedItems,
      totalBlackListEntities,
      currentPage: page,
      totalPages: Math.ceil(totalBlackListEntities / pageSize)
    });
  } catch (error) {
    console.error('Error fetching blacklist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add entity to blacklist
router.post('/blacklist/add', async (req, res) => {
  try {
    const { entityType, entityValue, tenant_name } = req.body;

    if (!entityType || !entityValue) {
      return res
        .status(400)
        .json({ error: 'Entity type and value are required' });
    }

    // For now, we'll simulate adding to blacklist
    // In production, this would save to your database
    console.log('Adding to blacklist:', {
      entityType,
      entityValue,
      tenant_name
    });

    // Simulate success
    res.status(200).json({
      success: true,
      message: 'Entity added to blacklist successfully',
      entity: {
        _id: Date.now().toString(),
        entityType,
        entityValue,
        source: 'Manual',
        createdAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error adding to blacklist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete entity from blacklist
router.post('/blacklist/delete', async (req, res) => {
  try {
    const { entityType, entityValue, tenant_name } = req.body;

    if (!entityType || !entityValue) {
      return res
        .status(400)
        .json({ error: 'Entity type and value are required' });
    }

    // For now, we'll simulate deletion
    // In production, this would remove from your database
    console.log('Deleting from blacklist:', {
      entityType,
      entityValue,
      tenant_name
    });

    // Simulate success
    res.status(200).json({
      success: true,
      message: 'Entity deleted from blacklist successfully'
    });
  } catch (error) {
    console.error('Error deleting from blacklist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get blacklist summary statistics
router.get('/blacklist/summary', async (req, res) => {
  try {
    // For now, we'll return mock summary data
    // In production, this would calculate from your database
    const summary = {
      totalEntities: 150,
      entitiesByType: {
        SSN: 45,
        ACCOUNT_EMAIL: 30,
        ACCOUNT_MOBILE: 25,
        IP_ADDRESS: 20,
        ACCOUNT_NAME: 15,
        TIN: 10,
        EIN: 5
      },
      recentAdditions: 12,
      lastUpdated: new Date()
    };

    res.json(summary);
  } catch (error) {
    console.error('Error fetching blacklist summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
