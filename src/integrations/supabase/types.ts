export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      abandoned_carts: {
        Row: {
          abandoned_at: string
          cart_id: string
          email: string | null
          id: string
          recovered: boolean | null
          recovered_at: string | null
          reminder_sent: boolean | null
          reminder_sent_at: string | null
          user_id: string | null
        }
        Insert: {
          abandoned_at?: string
          cart_id: string
          email?: string | null
          id?: string
          recovered?: boolean | null
          recovered_at?: string | null
          reminder_sent?: boolean | null
          reminder_sent_at?: string | null
          user_id?: string | null
        }
        Update: {
          abandoned_at?: string
          cart_id?: string
          email?: string | null
          id?: string
          recovered?: boolean | null
          recovered_at?: string | null
          reminder_sent?: boolean | null
          reminder_sent_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "abandoned_carts_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "abandoned_carts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_assistant_logs: {
        Row: {
          action_type: string
          created_at: string
          execution_time_ms: number | null
          id: string
          input_data: Json
          model_used: string | null
          organization_id: string
          output_data: Json
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          execution_time_ms?: number | null
          id?: string
          input_data: Json
          model_used?: string | null
          organization_id: string
          output_data: Json
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          execution_time_ms?: number | null
          id?: string
          input_data?: Json
          model_used?: string | null
          organization_id?: string
          output_data?: Json
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_assistant_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_snapshots: {
        Row: {
          avg_completion_time_hours: number | null
          blocked_tasks: number
          completed_tasks: number
          created_at: string
          id: string
          metrics_json: Json | null
          organization_id: string
          overdue_tasks: number
          risk_score: number | null
          snapshot_date: string
          team_utilization_pct: number | null
          total_tasks: number
          velocity_tasks_per_day: number | null
        }
        Insert: {
          avg_completion_time_hours?: number | null
          blocked_tasks?: number
          completed_tasks?: number
          created_at?: string
          id?: string
          metrics_json?: Json | null
          organization_id: string
          overdue_tasks?: number
          risk_score?: number | null
          snapshot_date?: string
          team_utilization_pct?: number | null
          total_tasks?: number
          velocity_tasks_per_day?: number | null
        }
        Update: {
          avg_completion_time_hours?: number | null
          blocked_tasks?: number
          completed_tasks?: number
          created_at?: string
          id?: string
          metrics_json?: Json | null
          organization_id?: string
          overdue_tasks?: number
          risk_score?: number | null
          snapshot_date?: string
          team_utilization_pct?: number | null
          total_tasks?: number
          velocity_tasks_per_day?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_snapshots_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      backup_settings: {
        Row: {
          auto_backup_enabled: boolean
          created_at: string
          frequency: string
          id: string
          last_backup_at: string | null
          next_backup_at: string | null
          updated_at: string
        }
        Insert: {
          auto_backup_enabled?: boolean
          created_at?: string
          frequency?: string
          id?: string
          last_backup_at?: string | null
          next_backup_at?: string | null
          updated_at?: string
        }
        Update: {
          auto_backup_enabled?: boolean
          created_at?: string
          frequency?: string
          id?: string
          last_backup_at?: string | null
          next_backup_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          cart_id: string
          created_at: string
          id: string
          product_id: string
          quantity: number | null
        }
        Insert: {
          cart_id: string
          created_at?: string
          id?: string
          product_id: string
          quantity?: number | null
        }
        Update: {
          cart_id?: string
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          created_at: string
          id: string
          session_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          description_es: string | null
          description_fr: string | null
          description_pt: string | null
          description_zh: string | null
          id: string
          image_url: string | null
          name: string
          name_es: string | null
          name_fr: string | null
          name_pt: string | null
          name_zh: string | null
          parent_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          description_es?: string | null
          description_fr?: string | null
          description_pt?: string | null
          description_zh?: string | null
          id?: string
          image_url?: string | null
          name: string
          name_es?: string | null
          name_fr?: string | null
          name_pt?: string | null
          name_zh?: string | null
          parent_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          description_es?: string | null
          description_fr?: string | null
          description_pt?: string | null
          description_zh?: string | null
          id?: string
          image_url?: string | null
          name?: string
          name_es?: string | null
          name_fr?: string | null
          name_pt?: string | null
          name_zh?: string | null
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      ecommerce_roadmap_items: {
        Row: {
          acceptance_criteria: Json | null
          assigned_to: string | null
          blocked_reason: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string
          customer_facing_description: string | null
          customer_facing_title: string | null
          description: string | null
          effort: string
          execution_mode: string | null
          feature_name: string
          files_affected: string[] | null
          id: string
          impact: string
          item_number: string
          metadata: Json | null
          notes: string | null
          notify_customers: boolean | null
          phase_name: string
          phase_number: number
          priority: string
          sprint_name: string
          sprint_number: string
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          acceptance_criteria?: Json | null
          assigned_to?: string | null
          blocked_reason?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          customer_facing_description?: string | null
          customer_facing_title?: string | null
          description?: string | null
          effort?: string
          execution_mode?: string | null
          feature_name: string
          files_affected?: string[] | null
          id?: string
          impact?: string
          item_number: string
          metadata?: Json | null
          notes?: string | null
          notify_customers?: boolean | null
          phase_name: string
          phase_number: number
          priority?: string
          sprint_name: string
          sprint_number: string
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          acceptance_criteria?: Json | null
          assigned_to?: string | null
          blocked_reason?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          customer_facing_description?: string | null
          customer_facing_title?: string | null
          description?: string | null
          effort?: string
          execution_mode?: string | null
          feature_name?: string
          files_affected?: string[] | null
          id?: string
          impact?: string
          item_number?: string
          metadata?: Json | null
          notes?: string | null
          notify_customers?: boolean | null
          phase_name?: string
          phase_number?: number
          priority?: string
          sprint_name?: string
          sprint_number?: string
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          product_price: number
          quantity: number
          subtotal: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          product_price: number
          quantity: number
          subtotal: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          product_price?: number
          quantity?: number
          subtotal?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: string | null
          carrier: string | null
          created_at: string
          currency: string | null
          estimated_delivery_date: string | null
          id: string
          notes: string | null
          order_number: string
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          shipping: number | null
          shipping_address: string | null
          shipping_config_snapshot: Json | null
          status: Database["public"]["Enums"]["order_status"] | null
          stripe_payment_intent_id: string | null
          subtotal: number
          tax: number | null
          total: number
          tracking_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_address?: string | null
          carrier?: string | null
          created_at?: string
          currency?: string | null
          estimated_delivery_date?: string | null
          id?: string
          notes?: string | null
          order_number: string
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          shipping?: number | null
          shipping_address?: string | null
          shipping_config_snapshot?: Json | null
          status?: Database["public"]["Enums"]["order_status"] | null
          stripe_payment_intent_id?: string | null
          subtotal: number
          tax?: number | null
          total: number
          tracking_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_address?: string | null
          carrier?: string | null
          created_at?: string
          currency?: string | null
          estimated_delivery_date?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          shipping?: number | null
          shipping_address?: string | null
          shipping_config_snapshot?: Json | null
          status?: Database["public"]["Enums"]["order_status"] | null
          stripe_payment_intent_id?: string | null
          subtotal?: number
          tax?: number | null
          total?: number
          tracking_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          permissions: Json | null
          role: Database["public"]["Enums"]["project_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          permissions?: Json | null
          role?: Database["public"]["Enums"]["project_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          permissions?: Json | null
          role?: Database["public"]["Enums"]["project_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          max_phases: number
          max_tasks_per_phase: number
          max_users: number
          name: string
          plan_tier: string
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          max_phases?: number
          max_tasks_per_phase?: number
          max_users?: number
          name: string
          plan_tier?: string
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          max_phases?: number
          max_tasks_per_phase?: number
          max_users?: number
          name?: string
          plan_tier?: string
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      phases: {
        Row: {
          created_at: string
          created_by: string | null
          end_date: string | null
          goal: string | null
          id: string
          name: string
          notes: string | null
          order_index: number
          organization_id: string
          owner_user_id: string | null
          progress_pct: number | null
          risk_level: Database["public"]["Enums"]["risk_level"] | null
          start_date: string | null
          status: Database["public"]["Enums"]["phase_status"]
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          goal?: string | null
          id?: string
          name: string
          notes?: string | null
          order_index?: number
          organization_id: string
          owner_user_id?: string | null
          progress_pct?: number | null
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["phase_status"]
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          goal?: string | null
          id?: string
          name?: string
          notes?: string | null
          order_index?: number
          organization_id?: string
          owner_user_id?: string | null
          progress_pct?: number | null
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["phase_status"]
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "phases_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_features: {
        Row: {
          enable_ai_assistant: boolean
          enable_api_access: boolean
          enable_gantt: boolean
          enable_time_tracking: boolean
          enable_webhooks: boolean
          id: string
          max_phases: number
          max_tasks_per_phase: number
          max_users_per_org: number
          plan_tier: string
          price_monthly_usd: number
        }
        Insert: {
          enable_ai_assistant?: boolean
          enable_api_access?: boolean
          enable_gantt?: boolean
          enable_time_tracking?: boolean
          enable_webhooks?: boolean
          id?: string
          max_phases: number
          max_tasks_per_phase: number
          max_users_per_org: number
          plan_tier: string
          price_monthly_usd?: number
        }
        Update: {
          enable_ai_assistant?: boolean
          enable_api_access?: boolean
          enable_gantt?: boolean
          enable_time_tracking?: boolean
          enable_webhooks?: boolean
          id?: string
          max_phases?: number
          max_tasks_per_phase?: number
          max_users_per_org?: number
          plan_tier?: string
          price_monthly_usd?: number
        }
        Relationships: []
      }
      products: {
        Row: {
          category_id: string | null
          compare_at_price: number | null
          created_at: string
          description: string | null
          description_es: string | null
          description_fr: string | null
          description_pt: string | null
          description_zh: string | null
          id: string
          images: string[] | null
          is_active: boolean | null
          name: string
          name_es: string | null
          name_fr: string | null
          name_pt: string | null
          name_zh: string | null
          price: number
          reward_percentage: number | null
          shipping_included_in_price: boolean | null
          sku: string | null
          stock: number | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          compare_at_price?: number | null
          created_at?: string
          description?: string | null
          description_es?: string | null
          description_fr?: string | null
          description_pt?: string | null
          description_zh?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          name: string
          name_es?: string | null
          name_fr?: string | null
          name_pt?: string | null
          name_zh?: string | null
          price: number
          reward_percentage?: number | null
          shipping_included_in_price?: boolean | null
          sku?: string | null
          stock?: number | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          compare_at_price?: number | null
          created_at?: string
          description?: string | null
          description_es?: string | null
          description_fr?: string | null
          description_pt?: string | null
          description_zh?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          name?: string
          name_es?: string | null
          name_fr?: string | null
          name_pt?: string | null
          name_zh?: string | null
          price?: number
          reward_percentage?: number | null
          shipping_included_in_price?: boolean | null
          sku?: string | null
          stock?: number | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          birthday: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          postal_code: string | null
          updated_at: string
          welcome_bonus_claimed: boolean | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          birthday?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          postal_code?: string | null
          updated_at?: string
          welcome_bonus_claimed?: boolean | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          birthday?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          postal_code?: string | null
          updated_at?: string
          welcome_bonus_claimed?: boolean | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          order_id: string | null
          referral_code: string
          referred_id: string
          referrer_id: string
          reward_earned: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          order_id?: string | null
          referral_code: string
          referred_id: string
          referrer_id: string
          reward_earned?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string | null
          referral_code?: string
          referred_id?: string
          referrer_id?: string
          reward_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          helpful_count: number | null
          id: string
          images: string[] | null
          is_verified_purchase: boolean | null
          order_id: string | null
          product_id: string
          rating: number
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          helpful_count?: number | null
          id?: string
          images?: string[] | null
          is_verified_purchase?: boolean | null
          order_id?: string | null
          product_id: string
          rating: number
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          helpful_count?: number | null
          id?: string
          images?: string[] | null
          is_verified_purchase?: boolean | null
          order_id?: string | null
          product_id?: string
          rating?: number
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          order_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          order_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          order_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rewards_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards_campaigns: {
        Row: {
          allow_stacking: boolean | null
          auto_pause_on_budget: boolean | null
          budget_alert_threshold: number | null
          budget_limit_dollars: number | null
          budget_spent_dollars: number | null
          campaign_type: Database["public"]["Enums"]["campaign_type"]
          conditions: Json | null
          created_at: string
          created_by: string | null
          current_uses: number | null
          description: string | null
          end_date: string | null
          frequency: Database["public"]["Enums"]["campaign_frequency"]
          id: string
          max_uses_per_user: number | null
          max_uses_total: number | null
          name: string
          priority: number | null
          reward_value: number
          start_date: string | null
          status: Database["public"]["Enums"]["campaign_status"]
          store_id: string
          updated_at: string
          value_type: Database["public"]["Enums"]["earning_type"]
        }
        Insert: {
          allow_stacking?: boolean | null
          auto_pause_on_budget?: boolean | null
          budget_alert_threshold?: number | null
          budget_limit_dollars?: number | null
          budget_spent_dollars?: number | null
          campaign_type: Database["public"]["Enums"]["campaign_type"]
          conditions?: Json | null
          created_at?: string
          created_by?: string | null
          current_uses?: number | null
          description?: string | null
          end_date?: string | null
          frequency?: Database["public"]["Enums"]["campaign_frequency"]
          id?: string
          max_uses_per_user?: number | null
          max_uses_total?: number | null
          name: string
          priority?: number | null
          reward_value: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          store_id?: string
          updated_at?: string
          value_type?: Database["public"]["Enums"]["earning_type"]
        }
        Update: {
          allow_stacking?: boolean | null
          auto_pause_on_budget?: boolean | null
          budget_alert_threshold?: number | null
          budget_limit_dollars?: number | null
          budget_spent_dollars?: number | null
          campaign_type?: Database["public"]["Enums"]["campaign_type"]
          conditions?: Json | null
          created_at?: string
          created_by?: string | null
          current_uses?: number | null
          description?: string | null
          end_date?: string | null
          frequency?: Database["public"]["Enums"]["campaign_frequency"]
          id?: string
          max_uses_per_user?: number | null
          max_uses_total?: number | null
          name?: string
          priority?: number | null
          reward_value?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          store_id?: string
          updated_at?: string
          value_type?: Database["public"]["Enums"]["earning_type"]
        }
        Relationships: []
      }
      rewards_config: {
        Row: {
          calculation_notes: string | null
          created_at: string
          default_expiration_days: number | null
          earning_fixed_amount: number | null
          earning_percentage: number | null
          earning_type: Database["public"]["Enums"]["earning_type"]
          id: string
          include_shipping_in_points: boolean
          include_tax_in_points: boolean
          last_changed_by: string | null
          max_usage_percentage: number
          min_points_to_use: number
          points_per_dollar: number
          seasonal_multiplier: number | null
          show_conversion_rate: boolean
          show_percentage_to_users: boolean
          store_id: string
          updated_at: string
          vip_multiplier: number | null
        }
        Insert: {
          calculation_notes?: string | null
          created_at?: string
          default_expiration_days?: number | null
          earning_fixed_amount?: number | null
          earning_percentage?: number | null
          earning_type?: Database["public"]["Enums"]["earning_type"]
          id?: string
          include_shipping_in_points?: boolean
          include_tax_in_points?: boolean
          last_changed_by?: string | null
          max_usage_percentage?: number
          min_points_to_use?: number
          points_per_dollar?: number
          seasonal_multiplier?: number | null
          show_conversion_rate?: boolean
          show_percentage_to_users?: boolean
          store_id?: string
          updated_at?: string
          vip_multiplier?: number | null
        }
        Update: {
          calculation_notes?: string | null
          created_at?: string
          default_expiration_days?: number | null
          earning_fixed_amount?: number | null
          earning_percentage?: number | null
          earning_type?: Database["public"]["Enums"]["earning_type"]
          id?: string
          include_shipping_in_points?: boolean
          include_tax_in_points?: boolean
          last_changed_by?: string | null
          max_usage_percentage?: number
          min_points_to_use?: number
          points_per_dollar?: number
          seasonal_multiplier?: number | null
          show_conversion_rate?: boolean
          show_percentage_to_users?: boolean
          store_id?: string
          updated_at?: string
          vip_multiplier?: number | null
        }
        Relationships: []
      }
      roadmap_metrics: {
        Row: {
          avg_completion_time_hours: number | null
          blocked_tasks: number
          completed_tasks: number
          created_at: string
          date: string
          id: string
          in_progress_tasks: number
          metadata: Json | null
          risk_score: number | null
          total_tasks: number
          velocity_tasks_per_week: number | null
        }
        Insert: {
          avg_completion_time_hours?: number | null
          blocked_tasks?: number
          completed_tasks?: number
          created_at?: string
          date?: string
          id?: string
          in_progress_tasks?: number
          metadata?: Json | null
          risk_score?: number | null
          total_tasks?: number
          velocity_tasks_per_week?: number | null
        }
        Update: {
          avg_completion_time_hours?: number | null
          blocked_tasks?: number
          completed_tasks?: number
          created_at?: string
          date?: string
          id?: string
          in_progress_tasks?: number
          metadata?: Json | null
          risk_score?: number | null
          total_tasks?: number
          velocity_tasks_per_week?: number | null
        }
        Relationships: []
      }
      shipping_config: {
        Row: {
          api_credentials: Json | null
          api_provider: string | null
          created_at: string
          dropshipping_includes_shipping: boolean
          id: string
          last_changed_by: string | null
          manual_global_cost: number | null
          manual_rules: Json | null
          mode: Database["public"]["Enums"]["shipping_mode"]
          show_free_badge: boolean
          store_id: string
          updated_at: string
        }
        Insert: {
          api_credentials?: Json | null
          api_provider?: string | null
          created_at?: string
          dropshipping_includes_shipping?: boolean
          id?: string
          last_changed_by?: string | null
          manual_global_cost?: number | null
          manual_rules?: Json | null
          mode?: Database["public"]["Enums"]["shipping_mode"]
          show_free_badge?: boolean
          store_id?: string
          updated_at?: string
        }
        Update: {
          api_credentials?: Json | null
          api_provider?: string | null
          created_at?: string
          dropshipping_includes_shipping?: boolean
          id?: string
          last_changed_by?: string | null
          manual_global_cost?: number | null
          manual_rules?: Json | null
          mode?: Database["public"]["Enums"]["shipping_mode"]
          show_free_badge?: boolean
          store_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      system_backups: {
        Row: {
          backup_type: string
          created_at: string
          created_by: string | null
          error_message: string | null
          file_path: string
          file_size: number
          id: string
          metadata: Json | null
          status: string
        }
        Insert: {
          backup_type: string
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          file_path: string
          file_size?: number
          id?: string
          metadata?: Json | null
          status?: string
        }
        Update: {
          backup_type?: string
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          file_path?: string
          file_size?: number
          id?: string
          metadata?: Json | null
          status?: string
        }
        Relationships: []
      }
      task_comments: {
        Row: {
          author_user_id: string
          body: string
          created_at: string
          id: string
          task_id: string
          updated_at: string
        }
        Insert: {
          author_user_id: string
          body: string
          created_at?: string
          id?: string
          task_id: string
          updated_at?: string
        }
        Update: {
          author_user_id?: string
          body?: string
          created_at?: string
          id?: string
          task_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_history: {
        Row: {
          changed_at: string
          changed_by: string
          field_name: string
          id: string
          new_value: string | null
          old_value: string | null
          task_id: string
        }
        Insert: {
          changed_at?: string
          changed_by: string
          field_name: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          task_id: string
        }
        Update: {
          changed_at?: string
          changed_by?: string
          field_name?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_history_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_timelogs: {
        Row: {
          created_at: string
          hours: number
          id: string
          logged_at: string
          note: string | null
          task_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hours: number
          id?: string
          logged_at?: string
          note?: string | null
          task_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          hours?: number
          id?: string
          logged_at?: string
          note?: string | null
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_timelogs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assignee_user_id: string | null
          blocked_by: string[] | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          estimate_hours: number | null
          id: string
          links: Json | null
          order_index: number
          organization_id: string
          phase_id: string
          priority: Database["public"]["Enums"]["task_priority"]
          progress_pct: number | null
          risk_level: Database["public"]["Enums"]["risk_level"] | null
          status: Database["public"]["Enums"]["task_status"]
          tags: string[] | null
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          assignee_user_id?: string | null
          blocked_by?: string[] | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          estimate_hours?: number | null
          id?: string
          links?: Json | null
          order_index?: number
          organization_id: string
          phase_id: string
          priority?: Database["public"]["Enums"]["task_priority"]
          progress_pct?: number | null
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          status?: Database["public"]["Enums"]["task_status"]
          tags?: string[] | null
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          assignee_user_id?: string | null
          blocked_by?: string[] | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          estimate_hours?: number | null
          id?: string
          links?: Json | null
          order_index?: number
          organization_id?: string
          phase_id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          progress_pct?: number | null
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          status?: Database["public"]["Enums"]["task_status"]
          tags?: string[] | null
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "phases"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_deliveries: {
        Row: {
          attempt_count: number
          created_at: string
          delivered_at: string | null
          event_type: string
          id: string
          payload: Json
          response_body: string | null
          response_status: number | null
          webhook_id: string
        }
        Insert: {
          attempt_count?: number
          created_at?: string
          delivered_at?: string | null
          event_type: string
          id?: string
          payload: Json
          response_body?: string | null
          response_status?: number | null
          webhook_id: string
        }
        Update: {
          attempt_count?: number
          created_at?: string
          delivered_at?: string | null
          event_type?: string
          id?: string
          payload?: Json
          response_body?: string | null
          response_status?: number | null
          webhook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_deliveries_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhooks_config"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks_config: {
        Row: {
          created_at: string
          created_by: string | null
          events: string[]
          headers: Json | null
          id: string
          is_active: boolean
          name: string
          organization_id: string
          retry_count: number
          timeout_seconds: number
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          events?: string[]
          headers?: Json | null
          id?: string
          is_active?: boolean
          name: string
          organization_id: string
          retry_count?: number
          timeout_seconds?: number
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          events?: string[]
          headers?: Json | null
          id?: string
          is_active?: boolean
          name?: string
          organization_id?: string
          retry_count?: number
          timeout_seconds?: number
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhooks_config_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      wincova_ab_tests: {
        Row: {
          auto_deploy_on_success: boolean
          completed_at: string | null
          control_metrics: Json | null
          created_at: string
          deployed: boolean
          deployment_id: string
          duration_hours: number
          id: string
          metadata: Json | null
          started_at: string | null
          statistical_significance: number | null
          status: string
          test_name: string
          traffic_percentage: number
          updated_at: string
          variant_metrics: Json | null
          winner: string | null
        }
        Insert: {
          auto_deploy_on_success?: boolean
          completed_at?: string | null
          control_metrics?: Json | null
          created_at?: string
          deployed?: boolean
          deployment_id: string
          duration_hours?: number
          id?: string
          metadata?: Json | null
          started_at?: string | null
          statistical_significance?: number | null
          status?: string
          test_name: string
          traffic_percentage?: number
          updated_at?: string
          variant_metrics?: Json | null
          winner?: string | null
        }
        Update: {
          auto_deploy_on_success?: boolean
          completed_at?: string | null
          control_metrics?: Json | null
          created_at?: string
          deployed?: boolean
          deployment_id?: string
          duration_hours?: number
          id?: string
          metadata?: Json | null
          started_at?: string | null
          statistical_significance?: number | null
          status?: string
          test_name?: string
          traffic_percentage?: number
          updated_at?: string
          variant_metrics?: Json | null
          winner?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wincova_ab_tests_deployment_id_fkey"
            columns: ["deployment_id"]
            isOneToOne: false
            referencedRelation: "wincova_deployments"
            referencedColumns: ["id"]
          },
        ]
      }
      wincova_change_logs: {
        Row: {
          action: string
          change_id: string | null
          created_at: string
          details: string | null
          diagnosis_id: string
          id: string
          metadata: Json | null
          performed_by: string | null
          performed_by_name: string | null
        }
        Insert: {
          action: string
          change_id?: string | null
          created_at?: string
          details?: string | null
          diagnosis_id: string
          id?: string
          metadata?: Json | null
          performed_by?: string | null
          performed_by_name?: string | null
        }
        Update: {
          action?: string
          change_id?: string | null
          created_at?: string
          details?: string | null
          diagnosis_id?: string
          id?: string
          metadata?: Json | null
          performed_by?: string | null
          performed_by_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wincova_change_logs_change_id_fkey"
            columns: ["change_id"]
            isOneToOne: false
            referencedRelation: "wincova_changes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wincova_change_logs_diagnosis_id_fkey"
            columns: ["diagnosis_id"]
            isOneToOne: false
            referencedRelation: "wincova_diagnoses"
            referencedColumns: ["id"]
          },
        ]
      }
      wincova_changes: {
        Row: {
          after_image_url: string | null
          approval_notes: string | null
          approval_required: boolean
          approved_at: string | null
          approved_by: string | null
          before_image_url: string | null
          category: string
          code_changes: Json | null
          complexity_score: number
          confidence_score: number
          created_at: string
          description: string | null
          diagnosis_id: string
          estimated_conversion_gain: number | null
          estimated_performance_gain: number | null
          estimated_revenue_impact: number | null
          estimated_seo_gain: number | null
          id: string
          impact_score: number
          implementation_method: string | null
          metadata: Json | null
          risk_level: string
          safety_score: number
          status: string
          technical_details: string | null
          title: string
          updated_at: string
        }
        Insert: {
          after_image_url?: string | null
          approval_notes?: string | null
          approval_required?: boolean
          approved_at?: string | null
          approved_by?: string | null
          before_image_url?: string | null
          category: string
          code_changes?: Json | null
          complexity_score: number
          confidence_score: number
          created_at?: string
          description?: string | null
          diagnosis_id: string
          estimated_conversion_gain?: number | null
          estimated_performance_gain?: number | null
          estimated_revenue_impact?: number | null
          estimated_seo_gain?: number | null
          id?: string
          impact_score: number
          implementation_method?: string | null
          metadata?: Json | null
          risk_level?: string
          safety_score: number
          status?: string
          technical_details?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          after_image_url?: string | null
          approval_notes?: string | null
          approval_required?: boolean
          approved_at?: string | null
          approved_by?: string | null
          before_image_url?: string | null
          category?: string
          code_changes?: Json | null
          complexity_score?: number
          confidence_score?: number
          created_at?: string
          description?: string | null
          diagnosis_id?: string
          estimated_conversion_gain?: number | null
          estimated_performance_gain?: number | null
          estimated_revenue_impact?: number | null
          estimated_seo_gain?: number | null
          id?: string
          impact_score?: number
          implementation_method?: string | null
          metadata?: Json | null
          risk_level?: string
          safety_score?: number
          status?: string
          technical_details?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wincova_changes_diagnosis_id_fkey"
            columns: ["diagnosis_id"]
            isOneToOne: false
            referencedRelation: "wincova_diagnoses"
            referencedColumns: ["id"]
          },
        ]
      }
      wincova_code_deployments: {
        Row: {
          applied_at: string | null
          applied_by: string | null
          created_at: string | null
          deployment_mode: string
          error_message: string | null
          generated_code: Json
          github_commit_sha: string | null
          github_pr_url: string | null
          id: string
          metadata: Json | null
          roadmap_item_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          applied_at?: string | null
          applied_by?: string | null
          created_at?: string | null
          deployment_mode?: string
          error_message?: string | null
          generated_code: Json
          github_commit_sha?: string | null
          github_pr_url?: string | null
          id?: string
          metadata?: Json | null
          roadmap_item_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          applied_at?: string | null
          applied_by?: string | null
          created_at?: string | null
          deployment_mode?: string
          error_message?: string | null
          generated_code?: Json
          github_commit_sha?: string | null
          github_pr_url?: string | null
          id?: string
          metadata?: Json | null
          roadmap_item_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wincova_code_deployments_roadmap_item_id_fkey"
            columns: ["roadmap_item_id"]
            isOneToOne: false
            referencedRelation: "ecommerce_roadmap_items"
            referencedColumns: ["id"]
          },
        ]
      }
      wincova_compliance_checks: {
        Row: {
          compliance_score: number | null
          core_web_vitals_metrics: Json | null
          core_web_vitals_pass: boolean | null
          created_at: string
          critical_issues_count: number | null
          diagnosis_id: string
          gdpr_compliant: boolean | null
          gdpr_issues: Json | null
          id: string
          metadata: Json | null
          ssl_issues: Json | null
          ssl_secure: boolean | null
          status: string
          updated_at: string
          wcag_compliant: boolean | null
          wcag_issues: Json | null
          wcag_level: string | null
        }
        Insert: {
          compliance_score?: number | null
          core_web_vitals_metrics?: Json | null
          core_web_vitals_pass?: boolean | null
          created_at?: string
          critical_issues_count?: number | null
          diagnosis_id: string
          gdpr_compliant?: boolean | null
          gdpr_issues?: Json | null
          id?: string
          metadata?: Json | null
          ssl_issues?: Json | null
          ssl_secure?: boolean | null
          status?: string
          updated_at?: string
          wcag_compliant?: boolean | null
          wcag_issues?: Json | null
          wcag_level?: string | null
        }
        Update: {
          compliance_score?: number | null
          core_web_vitals_metrics?: Json | null
          core_web_vitals_pass?: boolean | null
          created_at?: string
          critical_issues_count?: number | null
          diagnosis_id?: string
          gdpr_compliant?: boolean | null
          gdpr_issues?: Json | null
          id?: string
          metadata?: Json | null
          ssl_issues?: Json | null
          ssl_secure?: boolean | null
          status?: string
          updated_at?: string
          wcag_compliant?: boolean | null
          wcag_issues?: Json | null
          wcag_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wincova_compliance_checks_diagnosis_id_fkey"
            columns: ["diagnosis_id"]
            isOneToOne: false
            referencedRelation: "wincova_diagnoses"
            referencedColumns: ["id"]
          },
        ]
      }
      wincova_deployments: {
        Row: {
          changes_deployed: Json
          completed_at: string | null
          created_at: string
          deployment_method: string
          diagnosis_id: string
          id: string
          metadata: Json | null
          metrics_after: Json | null
          metrics_before: Json | null
          rollback_at: string | null
          rollback_enabled: boolean
          rollback_reason: string | null
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          changes_deployed?: Json
          completed_at?: string | null
          created_at?: string
          deployment_method: string
          diagnosis_id: string
          id?: string
          metadata?: Json | null
          metrics_after?: Json | null
          metrics_before?: Json | null
          rollback_at?: string | null
          rollback_enabled?: boolean
          rollback_reason?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          changes_deployed?: Json
          completed_at?: string | null
          created_at?: string
          deployment_method?: string
          diagnosis_id?: string
          id?: string
          metadata?: Json | null
          metrics_after?: Json | null
          metrics_before?: Json | null
          rollback_at?: string | null
          rollback_enabled?: boolean
          rollback_reason?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wincova_deployments_diagnosis_id_fkey"
            columns: ["diagnosis_id"]
            isOneToOne: false
            referencedRelation: "wincova_diagnoses"
            referencedColumns: ["id"]
          },
        ]
      }
      wincova_diagnoses: {
        Row: {
          accessibility_score: number | null
          client_name: string
          competitors_data: Json | null
          compliance_score: number | null
          created_at: string
          diagnosis_data: Json
          id: string
          metadata: Json | null
          overall_score: number | null
          performance_score: number | null
          platform: string | null
          security_score: number | null
          seo_score: number | null
          site_url: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          accessibility_score?: number | null
          client_name: string
          competitors_data?: Json | null
          compliance_score?: number | null
          created_at?: string
          diagnosis_data?: Json
          id?: string
          metadata?: Json | null
          overall_score?: number | null
          performance_score?: number | null
          platform?: string | null
          security_score?: number | null
          seo_score?: number | null
          site_url: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          accessibility_score?: number | null
          client_name?: string
          competitors_data?: Json | null
          compliance_score?: number | null
          created_at?: string
          diagnosis_data?: Json
          id?: string
          metadata?: Json | null
          overall_score?: number | null
          performance_score?: number | null
          platform?: string | null
          security_score?: number | null
          seo_score?: number | null
          site_url?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      wincova_intelligence_data: {
        Row: {
          change_category: string
          change_type: string
          conversion_improvement: number | null
          created_at: string
          id: string
          industry: string | null
          initial_score: number | null
          metadata: Json | null
          performance_improvement: number | null
          platform: string | null
          revenue_impact: number | null
          seo_improvement: number | null
          site_size: string | null
          success: boolean
        }
        Insert: {
          change_category: string
          change_type: string
          conversion_improvement?: number | null
          created_at?: string
          id?: string
          industry?: string | null
          initial_score?: number | null
          metadata?: Json | null
          performance_improvement?: number | null
          platform?: string | null
          revenue_impact?: number | null
          seo_improvement?: number | null
          site_size?: string | null
          success: boolean
        }
        Update: {
          change_category?: string
          change_type?: string
          conversion_improvement?: number | null
          created_at?: string
          id?: string
          industry?: string | null
          initial_score?: number | null
          metadata?: Json | null
          performance_improvement?: number | null
          platform?: string | null
          revenue_impact?: number | null
          seo_improvement?: number | null
          site_size?: string | null
          success?: boolean
        }
        Relationships: []
      }
      wincova_market_sources_health: {
        Row: {
          consecutive_failures: number | null
          created_at: string
          http_status_code: number | null
          id: string
          last_check_at: string | null
          last_error: string | null
          last_success_at: string | null
          metadata: Json | null
          response_time_ms: number | null
          source_key: string
          source_name: string
          source_url: string
          status: string
          updated_at: string
        }
        Insert: {
          consecutive_failures?: number | null
          created_at?: string
          http_status_code?: number | null
          id?: string
          last_check_at?: string | null
          last_error?: string | null
          last_success_at?: string | null
          metadata?: Json | null
          response_time_ms?: number | null
          source_key: string
          source_name: string
          source_url: string
          status?: string
          updated_at?: string
        }
        Update: {
          consecutive_failures?: number | null
          created_at?: string
          http_status_code?: number | null
          id?: string
          last_check_at?: string | null
          last_error?: string | null
          last_success_at?: string | null
          metadata?: Json | null
          response_time_ms?: number | null
          source_key?: string
          source_name?: string
          source_url?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      woocommerce_category_mapping: {
        Row: {
          created_at: string
          id: string
          lovable_category_id: string
          updated_at: string
          woocommerce_category_id: string
          woocommerce_category_name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          lovable_category_id: string
          updated_at?: string
          woocommerce_category_id: string
          woocommerce_category_name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          lovable_category_id?: string
          updated_at?: string
          woocommerce_category_id?: string
          woocommerce_category_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "woocommerce_category_mapping_lovable_category_id_fkey"
            columns: ["lovable_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      woocommerce_product_mapping: {
        Row: {
          created_at: string
          id: string
          lovable_product_id: string
          updated_at: string
          woocommerce_product_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lovable_product_id: string
          updated_at?: string
          woocommerce_product_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lovable_product_id?: string
          updated_at?: string
          woocommerce_product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "woocommerce_product_mapping_lovable_product_id_fkey"
            columns: ["lovable_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      woocommerce_sync_logs: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          products_created: number | null
          products_failed: number | null
          products_synced: number | null
          products_updated: number | null
          started_at: string
          status: string
          sync_type: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          products_created?: number | null
          products_failed?: number | null
          products_synced?: number | null
          products_updated?: number | null
          started_at?: string
          status?: string
          sync_type?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          products_created?: number | null
          products_failed?: number | null
          products_synced?: number | null
          products_updated?: number | null
          started_at?: string
          status?: string
          sync_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_purchase_points: {
        Args: {
          p_shipping?: number
          p_store_id?: string
          p_subtotal: number
          p_tax?: number
        }
        Returns: number
      }
      get_active_campaign: {
        Args: {
          p_campaign_type: Database["public"]["Enums"]["campaign_type"]
          p_store_id?: string
        }
        Returns: {
          conditions: Json
          frequency: Database["public"]["Enums"]["campaign_frequency"]
          id: string
          name: string
          reward_value: number
          value_type: Database["public"]["Enums"]["earning_type"]
        }[]
      }
      get_active_rewards_config: {
        Args: { p_store_id?: string }
        Returns: {
          default_expiration_days: number
          earning_fixed_amount: number
          earning_percentage: number
          earning_type: Database["public"]["Enums"]["earning_type"]
          id: string
          max_usage_percentage: number
          min_points_to_use: number
          points_per_dollar: number
        }[]
      }
      get_active_shipping_config: {
        Args: { p_store_id?: string }
        Returns: {
          api_provider: string
          dropshipping_includes_shipping: boolean
          id: string
          manual_global_cost: number
          manual_rules: Json
          mode: Database["public"]["Enums"]["shipping_mode"]
          show_free_badge: boolean
        }[]
      }
      get_roadmap_progress: {
        Args: Record<PropertyKey, never>
        Returns: {
          blocked_items: number
          completed_items: number
          in_progress_items: number
          progress_percentage: number
          total_items: number
        }[]
      }
      get_user_org_role: {
        Args: { _org_id: string; _user_id: string }
        Returns: Database["public"]["Enums"]["project_role"]
      }
      grant_birthday_points: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      track_campaign_usage: {
        Args: { p_campaign_id: string; p_points_awarded: number }
        Returns: undefined
      }
      user_has_org_access: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      campaign_frequency: "once" | "daily" | "per_event" | "unlimited"
      campaign_status: "active" | "paused" | "completed" | "scheduled"
      campaign_type:
        | "welcome"
        | "review"
        | "referral"
        | "purchase"
        | "birthday"
        | "share"
        | "social_follow"
        | "custom"
      earning_type: "percentage" | "fixed"
      order_status:
        | "pending"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      phase_status: "planned" | "in_progress" | "blocked" | "completed"
      project_role: "owner" | "admin" | "dev" | "viewer"
      risk_level: "low" | "medium" | "high" | "critical"
      shipping_mode: "free" | "manual" | "api" | "dropshipping"
      task_priority: "low" | "medium" | "high" | "urgent"
      task_status: "todo" | "in_progress" | "blocked" | "done" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      campaign_frequency: ["once", "daily", "per_event", "unlimited"],
      campaign_status: ["active", "paused", "completed", "scheduled"],
      campaign_type: [
        "welcome",
        "review",
        "referral",
        "purchase",
        "birthday",
        "share",
        "social_follow",
        "custom",
      ],
      earning_type: ["percentage", "fixed"],
      order_status: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      payment_status: ["pending", "completed", "failed", "refunded"],
      phase_status: ["planned", "in_progress", "blocked", "completed"],
      project_role: ["owner", "admin", "dev", "viewer"],
      risk_level: ["low", "medium", "high", "critical"],
      shipping_mode: ["free", "manual", "api", "dropshipping"],
      task_priority: ["low", "medium", "high", "urgent"],
      task_status: ["todo", "in_progress", "blocked", "done", "cancelled"],
    },
  },
} as const
