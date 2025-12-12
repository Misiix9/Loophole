// Centralized plan configuration - Single source of truth
// Use this across landing page, dashboard, billing modal, and enforcement logic

export type PlanTier = 'hobby' | 'creator' | 'startup';

export interface PlanConfig {
    id: PlanTier;
    name: string;
    price: number;
    priceDisplay: string;
    description: string;
    features: string[];
    limits: {
        maxTunnels: number;
        maxCustomSubdomains: number;
        maxTeamMembers: number;
        tcpTunnels: boolean;
        websocketTunnels: boolean;
        passwordProtection: boolean;
        requestLogging: boolean;
        prioritySupport: boolean;
        sla: boolean;
    };
    popular?: boolean;
    stripePriceEnvKey?: string;
}

export const PLANS: Record<PlanTier, PlanConfig> = {
    hobby: {
        id: 'hobby',
        name: 'Hobby',
        price: 0,
        priceDisplay: '$0',
        description: 'For tinkering and side projects.',
        features: [
            'Unlimited HTTP tunnels',
            'Random subdomains',
            '1 concurrent tunnel',
            'Community support'
        ],
        limits: {
            maxTunnels: 1,
            maxCustomSubdomains: 0,
            maxTeamMembers: 1,
            tcpTunnels: false,
            websocketTunnels: false,
            passwordProtection: false,
            requestLogging: false,
            prioritySupport: false,
            sla: false,
        },
    },
    creator: {
        id: 'creator',
        name: 'Creator',
        price: 9,
        priceDisplay: '$9',
        description: 'For serious developers and freelancers.',
        features: [
            'Everything in Hobby',
            '3 Custom subdomains',
            '3 concurrent tunnels',
            'Password protection',
            'TCP & WebSocket tunnels',
            'Priority Email Support'
        ],
        limits: {
            maxTunnels: 3,
            maxCustomSubdomains: 3,
            maxTeamMembers: 1,
            tcpTunnels: true,
            websocketTunnels: true,
            passwordProtection: true,
            requestLogging: true,
            prioritySupport: true,
            sla: false,
        },
        popular: true,
        stripePriceEnvKey: 'STRIPE_PRICE_ID_CREATOR',
    },
    startup: {
        id: 'startup',
        name: 'Startup',
        price: 29,
        priceDisplay: '$29',
        description: 'For small teams building next-gen apps.',
        features: [
            'Everything in Creator',
            '5 Team Members',
            'Centralized dashboard',
            'Team Audit logs',
            'Shared custom domains',
            '99.9% SLA'
        ],
        limits: {
            maxTunnels: 10,
            maxCustomSubdomains: 10,
            maxTeamMembers: 5,
            tcpTunnels: true,
            websocketTunnels: true,
            passwordProtection: true,
            requestLogging: true,
            prioritySupport: true,
            sla: true,
        },
        stripePriceEnvKey: 'STRIPE_PRICE_ID_STARTUP',
    },
};

export const PLAN_ORDER: PlanTier[] = ['hobby', 'creator', 'startup'];

// Helper functions
export function getPlan(tier: PlanTier | string | null | undefined): PlanConfig {
    if (tier && tier in PLANS) {
        return PLANS[tier as PlanTier];
    }
    return PLANS.hobby; // Default to hobby
}

export function canUpgrade(currentTier: PlanTier, targetTier: PlanTier): boolean {
    const currentIndex = PLAN_ORDER.indexOf(currentTier);
    const targetIndex = PLAN_ORDER.indexOf(targetTier);
    return targetIndex > currentIndex;
}

export function checkPlanLimit(
    userPlan: PlanTier,
    limitKey: keyof PlanConfig['limits'],
    currentUsage?: number
): { allowed: boolean; limit: number | boolean; message?: string } {
    const plan = getPlan(userPlan);
    const limit = plan.limits[limitKey];

    if (typeof limit === 'boolean') {
        return {
            allowed: limit,
            limit,
            message: limit ? undefined : `${limitKey} requires a paid plan`,
        };
    }

    if (typeof currentUsage === 'number') {
        const allowed = currentUsage < limit;
        return {
            allowed,
            limit,
            message: allowed ? undefined : `You've reached the limit of ${limit} for your ${plan.name} plan`,
        };
    }

    return { allowed: true, limit };
}
