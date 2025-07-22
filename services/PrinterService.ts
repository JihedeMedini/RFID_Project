import AsyncStorage from '@react-native-async-storage/async-storage';
import { Item } from './types';
import { generateZPLLabel } from './mockData';

// Printer connection types
export enum PrinterConnectionType {
  BLUETOOTH = 'BLUETOOTH',
  WIFI = 'WIFI',
  USB = 'USB'
}

// Printer status
export enum PrinterStatus {
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  ERROR = 'ERROR',
  OUT_OF_PAPER = 'OUT_OF_PAPER',
  PRINTING = 'PRINTING'
}

// Printer device interface
export interface PrinterDevice {
  id: string;
  name: string;
  address: string;
  type: PrinterConnectionType;
  status: PrinterStatus;
  lastConnected?: string;
  isDefault?: boolean;
}

// Print job interface
export interface PrintJob {
  id: string;
  tagId: string;
  itemId: string;
  templateId: string;
  status: 'pending' | 'printing' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
}

// Label template interface
export interface LabelTemplate {
  id: string;
  name: string;
  description?: string;
  width: number; // in mm
  height: number; // in mm
  previewImage: string;
  isDefault?: boolean;
}

// Storage keys
const STORAGE_PRINTER_DEVICES = 'rfid_printer_devices';
const STORAGE_PRINT_JOBS = 'rfid_print_jobs';
const STORAGE_CURRENT_PRINTER = 'rfid_current_printer';

// Mock printers
const MOCK_PRINTERS: PrinterDevice[] = [
  {
    id: 'printer-001',
    name: 'Zebra ZD420',
    address: '00:11:22:33:44:55',
    type: PrinterConnectionType.BLUETOOTH,
    status: PrinterStatus.DISCONNECTED,
    lastConnected: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    isDefault: true
  },
  {
    id: 'printer-002',
    name: 'RFID Label Printer',
    address: '192.168.1.100',
    type: PrinterConnectionType.WIFI,
    status: PrinterStatus.DISCONNECTED,
    lastConnected: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
  },
  {
    id: 'printer-003',
    name: 'Desktop Tag Printer',
    address: 'USB001',
    type: PrinterConnectionType.USB,
    status: PrinterStatus.DISCONNECTED
  }
];

// Mock label templates
export const LABEL_TEMPLATES: LabelTemplate[] = [
  {
    id: 'template-001',
    name: 'Standard Tag',
    description: 'Standard RFID tag with item name, SKU, and tag ID',
    width: 60,
    height: 30,
    previewImage: 'https://i.ibb.co/7gfCVqR/standard-label.png',
    isDefault: true
  },
  {
    id: 'template-002',
    name: 'Large Tag',
    description: 'Larger RFID tag with additional details',
    width: 100,
    height: 60,
    previewImage: 'https://i.ibb.co/KVvfxZn/large-label.png'
  },
  {
    id: 'template-003',
    name: 'Small Tag',
    description: 'Compact RFID tag for small items',
    width: 40,
    height: 20,
    previewImage: 'https://i.ibb.co/W32x8wk/small-label.png'
  }
];

class PrinterService {
  /**
   * Initialize the service with mock data
   */
  async initMockData(): Promise<void> {
    try {
      // Check if mock data already exists
      const existingDevices = await AsyncStorage.getItem(STORAGE_PRINTER_DEVICES);
      if (!existingDevices) {
        await AsyncStorage.setItem(STORAGE_PRINTER_DEVICES, JSON.stringify(MOCK_PRINTERS));
      }
    } catch (error) {
      console.error('Error initializing mock printer data:', error);
    }
  }
  
  /**
   * Get all available printers
   */
  async getAvailablePrinters(): Promise<PrinterDevice[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_PRINTER_DEVICES);
      return data ? JSON.parse(data) : MOCK_PRINTERS;
    } catch (error) {
      console.error('Error getting printer devices:', error);
      return MOCK_PRINTERS;
    }
  }
  
  /**
   * Get the current printer
   */
  async getCurrentPrinter(): Promise<PrinterDevice | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_CURRENT_PRINTER);
      if (data) {
        return JSON.parse(data);
      }
      
      // If no current printer is set, return the default one
      const printers = await this.getAvailablePrinters();
      const defaultPrinter = printers.find(p => p.isDefault) || printers[0] || null;
      
      if (defaultPrinter) {
        await this.setCurrentPrinter(defaultPrinter.id);
      }
      
      return defaultPrinter;
    } catch (error) {
      console.error('Error getting current printer:', error);
      return null;
    }
  }
  
  /**
   * Set the current printer
   */
  async setCurrentPrinter(printerId: string): Promise<PrinterDevice | null> {
    try {
      const printers = await this.getAvailablePrinters();
      const printer = printers.find(p => p.id === printerId);
      
      if (printer) {
        await AsyncStorage.setItem(STORAGE_CURRENT_PRINTER, JSON.stringify(printer));
        return printer;
      }
      
      return null;
    } catch (error) {
      console.error('Error setting current printer:', error);
      return null;
    }
  }
  
  /**
   * Connect to a printer (simulated)
   */
  async connectToPrinter(printerId: string): Promise<boolean> {
    try {
      const printers = await this.getAvailablePrinters();
      const updatedPrinters = printers.map(printer => {
        if (printer.id === printerId) {
          return {
            ...printer,
            status: PrinterStatus.CONNECTED,
            lastConnected: new Date().toISOString()
          };
        }
        return printer;
      });
      
      await AsyncStorage.setItem(STORAGE_PRINTER_DEVICES, JSON.stringify(updatedPrinters));
      
      // Set as current printer
      await this.setCurrentPrinter(printerId);
      
      return true;
    } catch (error) {
      console.error('Error connecting to printer:', error);
      return false;
    }
  }
  
  /**
   * Disconnect from a printer (simulated)
   */
  async disconnectPrinter(printerId: string): Promise<boolean> {
    try {
      const printers = await this.getAvailablePrinters();
      const updatedPrinters = printers.map(printer => {
        if (printer.id === printerId) {
          return {
            ...printer,
            status: PrinterStatus.DISCONNECTED
          };
        }
        return printer;
      });
      
      await AsyncStorage.setItem(STORAGE_PRINTER_DEVICES, JSON.stringify(updatedPrinters));
      
      return true;
    } catch (error) {
      console.error('Error disconnecting from printer:', error);
      return false;
    }
  }
  
  /**
   * Get all available label templates
   */
  getAvailableTemplates(): LabelTemplate[] {
    return LABEL_TEMPLATES;
  }
  
  /**
   * Get the default template
   */
  getDefaultTemplate(): LabelTemplate {
    return LABEL_TEMPLATES.find(t => t.isDefault) || LABEL_TEMPLATES[0];
  }
  
  /**
   * Get a template by ID
   */
  getTemplateById(templateId: string): LabelTemplate | undefined {
    return LABEL_TEMPLATES.find(t => t.id === templateId);
  }
  
  /**
   * Print a tag (simulated)
   */
  async printTag(tagId: string, itemId: string, templateId: string): Promise<PrintJob | null> {
    try {
      // Check if current printer is connected
      const printer = await this.getCurrentPrinter();
      if (!printer || printer.status !== PrinterStatus.CONNECTED) {
        throw new Error('No printer connected');
      }
      
      // Create a print job
      const printJob: PrintJob = {
        id: `job-${Date.now()}`,
        tagId,
        itemId,
        templateId,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      // Get existing print jobs
      const jobsData = await AsyncStorage.getItem(STORAGE_PRINT_JOBS);
      const jobs: PrintJob[] = jobsData ? JSON.parse(jobsData) : [];
      
      // Add the new job
      jobs.push(printJob);
      await AsyncStorage.setItem(STORAGE_PRINT_JOBS, JSON.stringify(jobs));
      
      // Simulate printing process
      setTimeout(async () => {
        try {
          const jobsData = await AsyncStorage.getItem(STORAGE_PRINT_JOBS);
          const jobs: PrintJob[] = jobsData ? JSON.parse(jobsData) : [];
          
          const updatedJobs = jobs.map(job => {
            if (job.id === printJob.id) {
              return {
                ...job,
                status: 'completed',
                completedAt: new Date().toISOString()
              };
            }
            return job;
          });
          
          await AsyncStorage.setItem(STORAGE_PRINT_JOBS, JSON.stringify(updatedJobs));
        } catch (error) {
          console.error('Error updating print job status:', error);
        }
      }, 2000); // Simulate 2 seconds of printing time
      
      return printJob;
    } catch (error) {
      console.error('Error printing tag:', error);
      return null;
    }
  }
  
  /**
   * Get print jobs
   */
  async getPrintJobs(): Promise<PrintJob[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_PRINT_JOBS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting print jobs:', error);
      return [];
    }
  }
  
  /**
   * Simulate a random printer error
   */
  async simulateError(printerId: string): Promise<void> {
    try {
      const errorStatuses = [
        PrinterStatus.ERROR,
        PrinterStatus.OUT_OF_PAPER,
        PrinterStatus.DISCONNECTED
      ];
      
      const randomError = errorStatuses[Math.floor(Math.random() * errorStatuses.length)];
      
      const printers = await this.getAvailablePrinters();
      const updatedPrinters = printers.map(printer => {
        if (printer.id === printerId) {
          return {
            ...printer,
            status: randomError
          };
        }
        return printer;
      });
      
      await AsyncStorage.setItem(STORAGE_PRINTER_DEVICES, JSON.stringify(updatedPrinters));
    } catch (error) {
      console.error('Error simulating printer error:', error);
    }
  }
  
  /**
   * Generate a preview of the label based on the template and item data
   * This would typically generate an image URL, but we'll return a placeholder
   */
  generateLabelPreview(template: LabelTemplate, tagId: string, item: Item): string {
    // In a real application, this would generate an actual preview image
    // For this mock, we'll just return the template preview
    return template.previewImage;
  }
}

// Create singleton instance
const printerService = new PrinterService();

// Initialize mock data
printerService.initMockData();

export default printerService; 