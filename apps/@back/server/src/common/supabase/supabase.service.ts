import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { createClient, SupabaseClient } from "@supabase/supabase-js";

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private anonClientInstance: SupabaseClient;
  private serviceRoleClientInstance: SupabaseClient;

  constructor(private readonly configService: ConfigService) {}

  getClient() {
    this.logger.log("getting supabase client...");
    if (this.anonClientInstance && this.serviceRoleClientInstance) {
      return { anon: this.anonClientInstance, serviceRole: this.serviceRoleClientInstance };
    }

    this.logger.log("initialising new supabase client");

    this.anonClientInstance = createClient(
      this.configService.get("SUPABASE_URL"),
      this.configService.get("SUPABASE_ANON_KEY")
    );
    this.serviceRoleClientInstance = createClient(
      this.configService.get("SUPABASE_URL"),
      this.configService.get("SUPABASE_SERVICE_ROLE_KEY")
    );

    return { anon: this.anonClientInstance, serviceRole: this.serviceRoleClientInstance };
  }
}
