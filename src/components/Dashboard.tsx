import React, { useEffect, useState } from 'react';
import { useSharedStore } from '../services/shared-store';
import { syncClient } from '../services/sync-client';
import { notificationService } from '../services/notification-service';
import { apiClient } from '../services/api-client';
import { authService } from '../services/auth-service';

export const CustomerDashboard: React.FC = () => {
  const { profile, products, promotions, loading, error, setProfile, setProducts, setPromotions } = useSharedStore();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect WebSocket
    syncClient.connect()
      .then(() => setIsConnected(true))
      .catch(err => {
        console.error('Failed to connect:', err);
        notificationService.error('Connection Error', 'Failed to connect to real-time updates');
      });

    // Load initial data
    loadData();

    // Subscribe to real-time updates
    const unsubscribeProducts = syncClient.on('product.changed', (event) => {
      const { products: updatedProducts } = event.data;
      setProducts(updatedProducts);
      notificationService.info('Update', 'Product catalog refreshed');
    });

    const unsubscribePromos = syncClient.on('promotion.active', (event) => {
      const { promotions: updatedPromos } = event.data;
      setPromotions(updatedPromos);
      notificationService.success('Special Offer', 'New promotion available!');
    });

    return () => {
      unsubscribeProducts();
      unsubscribePromos();
      syncClient.disconnect();
    };
  }, []);

  const loadData = async () => {
    try {
      const token = authService.getToken();
      if (!token) return;

      const [productsData, promotionsData] = await Promise.all([
        apiClient.getProducts(),
        apiClient.getPromotions(),
      ]);

      setProducts(productsData);
      setPromotions(promotionsData);
    } catch (err) {
      notificationService.error('Load Error', 'Failed to load data');
      console.error('Failed to load data:', err);
    }
  };

  return (
    <div className="dashboard">
      <div className="status-bar">
        <span className={`status ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </span>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="dashboard-grid">
        <section className="dashboard-section">
          <h2>Your Profile</h2>
          {loading ? (
            <p>Loading...</p>
          ) : profile ? (
            <div className="profile-card">
              <p><strong>Name:</strong> {profile.name}</p>
              <p><strong>Email:</strong> {profile.email}</p>
              <span className={`status ${profile.status}`}>{profile.status}</span>
            </div>
          ) : (
            <p>No profile data</p>
          )}
        </section>

        <section className="dashboard-section">
          <h2>Featured Products ({products.length})</h2>
          <div className="data-list">
            {products.slice(0, 5).map((product) => (
              <div key={product.id} className="data-item">
                <strong>{product.name}</strong>
                <p>${product.price.toFixed(2)}</p>
                <p>Stock: {product.stock}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-section">
          <h2>Active Promotions ({promotions.filter(p => p.active).length})</h2>
          <div className="data-list">
            {promotions.filter(p => p.active).map((promo) => (
              <div key={promo.id} className="data-item promotion">
                <strong>{promo.title}</strong>
                <p>{promo.description}</p>
                <p className="discount">{promo.discount}% OFF!</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <style>{`
        .dashboard {
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .status-bar {
          padding: 10px;
          margin-bottom: 20px;
          background: #f5f5f5;
          border-radius: 8px;
        }
        .status {
          font-weight: 600;
          font-size: 14px;
        }
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 20px;
        }
        .dashboard-section {
          padding: 16px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          background: white;
        }
        .profile-card {
          padding: 12px;
          border: 1px solid #f0f0f0;
          border-radius: 4px;
          background: #fafafa;
        }
        .data-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .data-item {
          padding: 12px;
          border: 1px solid #f0f0f0;
          border-radius: 4px;
          background: #fafafa;
          transition: all 0.2s;
        }
        .data-item:hover {
          background: #f0f0f0;
        }
        .data-item.promotion {
          background: #fffbeb;
          border-color: #fcd34d;
        }
        .discount {
          font-size: 16px;
          font-weight: bold;
          color: #d97706;
        }
        .error-banner {
          padding: 12px;
          margin-bottom: 20px;
          background: #fee;
          color: #c00;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};
