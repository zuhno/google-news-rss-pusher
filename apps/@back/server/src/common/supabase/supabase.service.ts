import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { createClient, SupabaseClient } from "@supabase/supabase-js";

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private clientInstance: SupabaseClient;

  constructor(private readonly configService: ConfigService) {}

  getClient() {
    this.logger.log("getting supabase client...");
    if (this.clientInstance) {
      return this.clientInstance;
    }

    this.logger.log("initialising new supabase client");

    this.clientInstance = createClient(
      this.configService.get("SUPABASE_URL"),
      this.configService.get("SUPABASE_KEY")
    );

    return this.clientInstance;
  }
}
