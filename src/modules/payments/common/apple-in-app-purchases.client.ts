import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { AppleInAppPurchasesEnvironments } from './apple-in-app-purchases-environments.enum';

export interface VerifyReceiptDataResponse {
  latest_receipt_info?: Array<{
    purchase_date_ms: string;
    transaction_id: string;
    original_transaction_id: string;
    expires_date_ms: string;
  }>;
  environment: AppleInAppPurchasesEnvironments;
  status: number;
}

@Injectable()
export class AppleInAppPurchasesClient {
  private password: string;

  constructor(private configService: ConfigService) {
    this.password = this.configService.get('appleInAppPurchases.password');
  }

  async verifyReceiptData(
    receiptData: string,
  ): Promise<VerifyReceiptDataResponse> {
    const { prodBaseURL, sandboxBaseURL } = this.configService.get(
      'appleInAppPurchases',
    );
    const baseURL = '/verifyReceipt';
    const prodUrl = `${prodBaseURL}${baseURL}`;
    const sandboxUrl = `${sandboxBaseURL}${baseURL}`;

    const payload = {
      'receipt-data': receiptData,
      password: this.password,
      'exclude-old-transactions': true,
    };

    let { data } = await axios.post(prodUrl, payload);
    if (data.status !== 0) {
      const response = await axios.post(sandboxUrl, payload);
      data = response.data;
    }

    return data;
  }
}
