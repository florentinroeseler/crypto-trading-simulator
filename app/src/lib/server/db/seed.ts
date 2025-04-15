import { db } from './index';
import { assets } from './schema';
import * as dotenv from 'dotenv';

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('Starte das Seeding der Datenbank...');

    // Überprüfen, ob bereits Daten vorhanden sind
    const existingAssets = await db.select().from(assets);
    
    // Vorhandene Assets löschen
    console.log('Lösche vorhandene Assets...');
    await db.delete(assets);

    // Krypto-Assets einfügen
    const cryptoAssets = [
      {
        symbol: 'BTC',
        name: 'Bitcoin',
        type: 'crypto',
        currentPrice: 65423.42,
        imageUrl: 'images/bitcoin.png'
      },
      {
        symbol: 'ETH',
        name: 'Ethereum',
        type: 'crypto',
        currentPrice: 3567.89,
        imageUrl: 'images/ethereum.png'
      },
      {
        symbol: 'BNB',
        name: 'Binance Coin',
        type: 'crypto',
        currentPrice: 584.32,
        imageUrl: 'images/bnb.png'
      },
      {
        symbol: 'SOL',
        name: 'Solana',
        type: 'crypto',
        currentPrice: 142.75,
        imageUrl: 'images/solana.png'
      },
      {
        symbol: 'ADA',
        name: 'Cardano',
        type: 'crypto',
        currentPrice: 0.54,
        imageUrl: 'images/cardano.png'
      },
      {
        symbol: 'XRP',
        name: 'Ripple',
        type: 'crypto',
        currentPrice: 0.61,
        imageUrl: 'images/xrp.png'
      },
      {
        symbol: 'DOGE',
        name: 'Dogecoin',
        type: 'crypto',
        currentPrice: 0.15,
        imageUrl: 'images/dogecoin.png'
      },
      {
        symbol: 'DOT',
        name: 'Polkadot',
        type: 'crypto',
        currentPrice: 7.23,
        imageUrl: 'images/polkadot.png'
      },
      {
        symbol: 'AVAX',
        name: 'Avalanche',
        type: 'crypto',
        currentPrice: 35.86,
        imageUrl: 'images/avalanche.png'
      },
      {
        symbol: 'SHIB',
        name: 'Shiba Inu',
        type: 'crypto',
        currentPrice: 0.000023,
        imageUrl: 'images/shiba-inu.png'
      }
    ];

    // Assets in die Datenbank einfügen
    await db.insert(assets).values(cryptoAssets);

    console.log('Seeding abgeschlossen. 10 Krypto-Assets wurden hinzugefügt.');
  } catch (error) {
    console.error('Fehler beim Seeding der Datenbank:', error);
    process.exit(1);
  }
};

// Führe das Seeding aus
seedDatabase();