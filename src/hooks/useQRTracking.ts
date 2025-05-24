
import { useEffect } from 'react';
import { db, doc, updateDoc, getDoc, Timestamp } from '@/lib/firebase';

export const useQRTracking = () => {
  const trackQRScan = async (restaurantId: string) => {
    try {
      const restaurantRef = doc(db, 'restaurants', restaurantId);
      const restaurantDoc = await getDoc(restaurantRef);
      
      if (restaurantDoc.exists()) {
        const data = restaurantDoc.data();
        const currentQRScans = data.qrScans || 0;
        const lastScanDate = data.lastScanDate;
        const today = new Date().toDateString();
        
        // Update QR scan count
        await updateDoc(restaurantRef, {
          qrScans: currentQRScans + 1,
          lastScanDate: Timestamp.now(),
          lastScanDay: today
        });
        
        console.log('QR scan tracked successfully');
      }
    } catch (error) {
      console.error('Error tracking QR scan:', error);
    }
  };

  return { trackQRScan };
};
