import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "supabase-type";

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private anonClientInstance: SupabaseClient<Database>;
  private serviceRoleClientInstance: SupabaseClient<Database>;

  constructor(private readonly configService: ConfigService) {}

  getClient() {
    if (this.anonClientInstance && this.serviceRoleClientInstance) {
      return { anon: this.anonClientInstance, serviceRole: this.serviceRoleClientInstance };
    }

    this.logger.log("initializing new supabase client");

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
