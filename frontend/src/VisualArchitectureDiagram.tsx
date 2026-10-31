import React, { useState, useMemo, useCallback, useRef } from 'react';
import { 
  ReactFlow, 
  Controls, 
  Background, 
  MiniMap, 
  useNodesState, 
  useEdgesState, 
  MarkerType,
  BackgroundVariant,
  Panel,
  Edge,
  Node,
  useReactFlow,
  ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { 
  ZoomIn, ZoomOut, Maximize2, Download, Eye, Layers, 
  Shield, Server, Database, Globe, Cpu, Radio, CreditCard,
  Cloud, Activity, CheckCircle2, Lock, ArrowRight, Filter, 
  HelpCircle, X, ChevronRight, RefreshCw, AlertTriangle,
  Smartphone, LayoutDashboard, ShoppingCart, ShoppingBag, 
  PackageCheck, Boxes, Bell, Search, Zap, Mail, Truck,
  FileCode, Play, ExternalLink
} from 'lucide-react';

import { CleanArchitectureNode, CleanNodeData } from './CleanArchitectureNode';
import { LayerGroupNode } from './LayerGroupNode';
import { ModalPortal } from './PortalPrimitives';

interface VisualArchitectureDiagramProps {
  techStack: any;
  projectVersion?: number;
  onRefresh?: () => void;
}

const nodeTypes = {
  cleanNode: CleanArchitectureNode,
  groupNode: LayerGroupNode
};

function FlowCanvas({ techStack, projectVersion = 1, onRefresh }: VisualArchitectureDiagramProps) {
  const [selectedNodeData, setSelectedNodeData] = useState<CleanNodeData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'components' | 'data_flow'>('overview');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  // Dynamic Component Data derived from project techStack & requirements
  const rawComponents: CleanNodeData[] = useMemo(() => {
    const frontend = techStack?.Frontend || techStack?.frontend || 'React 19 + TypeScript (Vite SPA)';
    const backend = techStack?.Backend || techStack?.backend || 'Python FastAPI Microservices';
    const database = techStack?.Database || techStack?.database || 'PostgreSQL 16 (ACID Relational)';
    const cache = techStack?.Cache || techStack?.cache || 'Redis 7.2 Cluster';
    const auth = techStack?.Authentication || techStack?.auth || 'OAuth2 / Keycloak + RS256 JWT';
    const gateway = techStack?.['API Gateway'] || 'Kong API Gateway & Rate Limiter';
    const queue = techStack?.['Message Broker'] || 'RabbitMQ / Apache Kafka';
    const payment = techStack?.['Payment Gateway'] || techStack?.payment || 'Stripe + Razorpay Dual Adapter';
    const cloud = techStack?.Deployment || 'Kubernetes (EKS/GKE) + Terraform';
    const monitoring = techStack?.Observability || 'Prometheus + Grafana + OpenTelemetry';

    return [
      // 1. Layer 1 – Users & Clients (Grouped Container)
      {
        id: 'client_web',
        title: 'Web Application',
        subtitle: 'Customer Storefront SPA',
        category: 'client',
        tech: frontend,
        role: 'Omnichannel responsive web application for product catalog search, shopping cart, and one-click checkout.',
        responsibilities: [
          'Responsive catalog UI with P95 < 200ms page render',
          'Client-side cart state synchronization',
          'Tokenized PCI-compliant payment form submission',
          'Real-time order tracking and dispatch telemetry'
        ],
        securityNote: 'XSS sanitization, CSP headers, HttpOnly refresh cookies.',
        connections: ['api_gateway', 'auth_service']
      },
      {
        id: 'client_mobile',
        title: 'Mobile Application',
        subtitle: 'iOS & Android Native App',
        category: 'client',
        tech: 'React Native / Flutter',
        role: 'Native mobile client with biometric sign-in, camera barcode search, and push alerts.',
        responsibilities: [
          'Biometric authentication integration (FaceID / TouchID)',
          'Real-time push notifications on delivery milestones',
          'Offline product catalog caching',
          'Direct camera scan for product SKU lookup'
        ],
        securityNote: 'TLS certificate pinning, secure enclave token storage.',
        connections: ['api_gateway']
      },
      {
        id: 'client_admin',
        title: 'Admin Dashboard',
        subtitle: 'Operations & Inventory',
        category: 'client',
        tech: 'React 19 Admin Workspace',
        role: 'Internal back-office management console for merchandising, inventory replenishment, and customer support.',
        responsibilities: [
          'Real-time sales revenue and active session dashboards',
          'SKU inventory replenishment and pricing override',
          'Order exception review and refund authorizations',
          'Fine-grained team role permissions matrix'
        ],
        securityNote: 'Mandatory hardware MFA token, restricted IP subnet access.',
        connections: ['api_gateway']
      },

      // 2. Layer 2 – Entry & Security
      {
        id: 'api_gateway',
        title: 'API Gateway',
        subtitle: 'Ingress & Rate Limiter',
        category: 'gateway',
        tech: gateway,
        role: 'Unified entrance for all client traffic, SSL termination, rate limiting, and microservice route dispatch.',
        responsibilities: [
          'Edge TLS 1.3 termination and HTTP/2 protocol negotiation',
          'Token bucket rate limiting (10,000 requests/min)',
          'Dynamic path routing to internal microservices',
          'CORS preflight handling and header mutation'
        ],
        securityNote: 'Cloudflare WAF integration, DDoS mitigation, IP geo-blocking.',
        connections: ['auth_service', 'product_service', 'cart_service', 'order_service']
      },
      {
        id: 'auth_service',
        title: 'Authentication Service',
        subtitle: 'Identity Broker & RBAC',
        category: 'gateway',
        tech: auth,
        role: 'Centralized identity provider issuing RS256 asymmetric signed JWT tokens and managing user roles.',
        responsibilities: [
          'User credential verification & multi-factor auth (MFA)',
          'Cryptographic RS256 signed JWT tokens (15-min lifespan)',
          'Refresh token rotation with Redis fingerprinting',
          'Role-based access control (RBAC) permission evaluation'
        ],
        securityNote: 'Asymmetric key rotation, automated lockout after 5 failed attempts.',
        connections: ['cache_redis', 'db_main']
      },

      // 3. Layer 3 – Core Application Services (Grouped Container)
      {
        id: 'product_service',
        title: 'Product Service',
        subtitle: 'Catalog & Faceted Search',
        category: 'service',
        tech: backend,
        role: 'High-throughput product catalog, search filtering, and localized multi-currency pricing.',
        responsibilities: [
          'Sub-20ms cached catalog lookup for fast browsing',
          'Full-text product search and faceted categorization',
          'Dynamic FX rate conversion for international currencies',
          'Emits ProductPriceUpdated domain events'
        ],
        securityNote: 'Read-only replica database routing, rate-limited public endpoints.',
        connections: ['cache_redis', 'db_main']
      },
      {
        id: 'cart_service',
        title: 'Cart Service',
        subtitle: 'Shopping Basket & Locks',
        category: 'service',
        tech: 'FastAPI / Redis Session Worker',
        role: 'Active user shopping cart state and temporary inventory reservation holds.',
        responsibilities: [
          'Real-time cart addition and coupon discount deduction',
          '15-minute temporary inventory reservation lock',
          'Cross-device basket synchronization',
          'Emits CartAbandoned events'
        ],
        securityNote: 'Session cookie encryption, transient TTL automatic expiration.',
        connections: ['cache_redis', 'order_service']
      },
      {
        id: 'order_service',
        title: 'Order Service',
        subtitle: 'Checkout State Machine',
        category: 'service',
        tech: backend,
        role: 'Orchestrates multi-item checkout, atomic order state transitions, and invoice records.',
        responsibilities: [
          'State machine: Pending -> Paid -> Processing -> Shipped',
          'Enforces idempotency keys on checkout submissions',
          'Emits OrderCreated and OrderPaid domain events',
          'Calculates applicable sales taxes and delivery fees'
        ],
        securityNote: 'Strict idempotency keys, distributed transaction management.',
        connections: ['payment_service', 'inventory_service', 'queue_broker', 'db_main']
      },
      {
        id: 'payment_service',
        title: 'Payment Service',
        subtitle: 'Payment Broker & Settlement',
        category: 'service',
        tech: payment,
        role: 'Coordinates payment capture, credit card intent authorizations, and webhook verification.',
        responsibilities: [
          'Dispatches payment intent tokens to client browser',
          'Automated circuit breaker fallback to secondary gateway',
          'Cryptographic signature validation on webhook callbacks',
          'Refund and settlement ledger reconciliation'
        ],
        securityNote: 'PCI-DSS zero card storage; HMAC-SHA256 webhook signature validation.',
        connections: ['ext_payment', 'queue_broker', 'db_main']
      },
      {
        id: 'inventory_service',
        title: 'Inventory Service',
        subtitle: 'Warehouse Stock Deduction',
        category: 'service',
        tech: 'Python Async Worker + Redis Locks',
        role: 'Atomic inventory deduction, preventing race-condition overselling.',
        responsibilities: [
          'Atomic stock deduction via Redis distributed Redlock',
          'Low-stock threshold alerts to procurement',
          'Multi-warehouse routing and shipping distance calculation',
          'Deadlock detection and rollback handlers'
        ],
        securityNote: 'Row-level database locks (SELECT FOR UPDATE) preventing concurrency races.',
        connections: ['db_main', 'cache_redis', 'queue_broker']
      },
      {
        id: 'notification_service',
        title: 'Notification Service',
        subtitle: 'Email & SMS Dispatch',
        category: 'service',
        tech: 'Celery Distributed Task Queue',
        role: 'Asynchronously delivers order confirmation receipts, OTP verification, and shipping alerts.',
        responsibilities: [
          'Transactional email template rendering with customer invoice',
          'SMS dispatch for courier dispatch and delivery tracking',
          'Exponential backoff retry with Dead-Letter Queue (DLQ)',
          'Delivery status tracking and bounce telemetry'
        ],
        securityNote: 'Sanitized customer PII, GDPR consent compliance.',
        connections: ['ext_notification']
      },

      // 4. Layer 4 – Data Layer
      {
        id: 'db_main',
        title: 'Main Database',
        subtitle: 'PostgreSQL Relational Ledger',
        category: 'data',
        tech: database,
        role: 'ACID storage of record for users, orders, financial transactions, and catalog items.',
        responsibilities: [
          'Strong ACID transactional guarantees for financial ledgers',
          'Point-In-Time Recovery (PITR) via Write-Ahead Logs (WAL)',
          'Continuous asynchronous replication to read replicas',
          'Automated vacuuming and optimized B-tree indexing'
        ],
        securityNote: 'AES-256 encryption at rest, TLS 1.3 transit, hourly snapshots.',
        connections: ['sup_monitoring']
      },
      {
        id: 'cache_redis',
        title: 'Cache Layer',
        subtitle: 'In-Memory Key-Value Store',
        category: 'data',
        tech: cache,
        role: 'Ultra-low latency in-memory cache, active session store, and distributed locks.',
        responsibilities: [
          'Sub-2ms caching of high-traffic catalog items',
          'Distributed Redlock for atomic inventory reservation',
          'JWT session token blacklist verification',
          'Sliding-window API rate limiting counters'
        ],
        securityNote: 'Auth password protected, isolated subnet, memory eviction policies.',
        connections: ['sup_monitoring']
      },
      {
        id: 'queue_broker',
        title: 'Message Queue',
        subtitle: 'Event Streaming Backbone',
        category: 'data',
        tech: queue,
        role: 'Decoupled publish-subscribe message backbone with guaranteed at-least-once delivery.',
        responsibilities: [
          'Decouples high-velocity checkout from email/SMS dispatch',
          'Guaranteed at-least-once message delivery semantics',
          'Dead-Letter Queue (DLQ) for failed payment webhook retries',
          'Replay buffer for audit trail and disaster recovery'
        ],
        securityNote: 'SASL/SCRAM authentication, TLS encrypted topic partitions.',
        connections: ['notification_service', 'sup_monitoring']
      },

      // 5. Layer 5 – External Integrations
      {
        id: 'ext_payment',
        title: 'Payment Gateway',
        subtitle: 'Stripe & Razorpay APIs',
        category: 'integration',
        tech: 'External Banking Gateway',
        role: 'Third-party banking gateway for 3D-Secure credit cards and localized payment rails.',
        responsibilities: [
          'Card authorization and 3D Secure bank redirects',
          'Direct bank debit and localized UPI payments',
          'Asynchronous payment webhook status callbacks',
          'Multi-currency settlement and foreign exchange'
        ],
        securityNote: 'External PCI-DSS Level 1 certified environment.',
        connections: ['payment_service']
      },
      {
        id: 'ext_notification',
        title: 'Email / SMS Provider',
        subtitle: 'SendGrid & Twilio Gateway',
        category: 'integration',
        tech: 'External Carrier Dispatch',
        role: 'External communications provider delivering emails, SMS text alerts, and WhatsApp receipts.',
        responsibilities: [
          'High deliverability email relay via SendGrid',
          'Global SMS carrier delivery via Twilio',
          'Webhook callback for delivery bounces and unsubscribes',
          'Automated suppression list management'
        ],
        securityNote: 'Restricted API tokens, GDPR consent unsubscribes.',
        connections: []
      },
      {
        id: 'ext_shipping',
        title: 'Shipping Provider',
        subtitle: 'FedEx / DHL Courier APIs',
        category: 'integration',
        tech: 'Logistics Carrier APIs',
        role: 'External carrier integration for automated shipping label generation and real-time tracking.',
        responsibilities: [
          'Automated shipping rate calculation by weight and zone',
          'Barcode shipping label PDF generation',
          'Webhook callbacks on delivery scan milestones',
          'Address verification and postal code validation'
        ],
        securityNote: 'Encrypted carrier credentials, rate-limited dispatch.',
        connections: ['order_service']
      },

      // Supporting Components (Left and Right Sides)
      {
        id: 'sup_security',
        title: 'Security & WAF Layer',
        subtitle: 'Cloudflare Edge Shield',
        category: 'supporting',
        tech: 'Cloudflare WAF + SSL/TLS 1.3',
        role: 'Perimeter defense protecting against DDoS attacks, SQL injection, and unauthorized scanners.',
        responsibilities: [
          'Edge SSL/TLS 1.3 encryption',
          'Managed OWASP Core Rule Set against SQLi/XSS',
          'Bot detection and challenge puzzles',
          'Real-time traffic anomaly filtering'
        ],
        securityNote: 'Full proxy encryption, zero direct origin IP exposure.',
        connections: ['api_gateway']
      },
      {
        id: 'sup_monitoring',
        title: 'Monitoring & APM',
        subtitle: 'Prometheus & Grafana',
        category: 'supporting',
        tech: monitoring,
        role: 'Real-time telemetry, distributed tracing, and automated system health alerting.',
        responsibilities: [
          'P95/P99 latency tracking across all API routes',
          'Distributed trace propagation (W3C TraceContext)',
          'Automated Slack/PagerDuty alerting when error rates > 1%',
          'Host node saturation and container memory leak detection'
        ],
        securityNote: 'Sanitized request payloads (zero PII logged), air-gapped metric store.',
        connections: []
      },
      {
        id: 'sup_cloud',
        title: 'Cloud Infrastructure',
        subtitle: 'Kubernetes Cluster',
        category: 'supporting',
        tech: cloud,
        role: 'Elastic container orchestration hosting microservices with automated horizontal pod autoscaling.',
        responsibilities: [
          'Horizontal Pod Autoscaling (HPA) targeting 70% CPU usage',
          'Zero-downtime rolling updates with readiness health probes',
          'Multi-Availability-Zone fault tolerance',
          'Terraform declarative infrastructure-as-code state'
        ],
        securityNote: 'Distroless container images, read-only root filesystems, NetworkPolicies.',
        connections: ['sup_monitoring']
      }
    ];
  }, [techStack]);

  // Clean, neatly arranged flowchart layout with grouped containers
  const initialNodes: Node[] = useMemo(() => {
    // Canvas dimensions:
    // Left side supporting: X = 40
    // Center column: X = 280 to 980 (Width = 700px)
    // Right side supporting: X = 1040

    return [
      // --- BACKGROUND GROUP CONTAINERS ---
      // Group 1: Users & Clients
      {
        id: 'group_clients',
        type: 'groupNode',
        position: { x: 260, y: 30 },
        data: {
          label: 'Layer 1: Users & Clients',
          badge: 'Presentation Tier',
          width: 740,
          height: 125,
          borderColor: 'border-[#CADAE4]',
          bgColor: 'bg-[#F9FBFC]/80'
        },
        selectable: false,
        draggable: false
      },
      // Group 2: Core Application Services
      {
        id: 'group_services',
        type: 'groupNode',
        position: { x: 260, y: 320 },
        data: {
          label: 'Layer 3: Core Application Microservices',
          badge: 'Business Logic Tier',
          width: 740,
          height: 250,
          borderColor: 'border-[#D1DFD6]',
          bgColor: 'bg-[#F9FAF8]/80'
        },
        selectable: false,
        draggable: false
      },

      // --- LAYER 1: USERS & CLIENTS (3 nodes side by side) ---
      {
        id: 'client_web',
        type: 'cleanNode',
        position: { x: 280, y: 65 },
        data: rawComponents.find(c => c.id === 'client_web')!
      },
      {
        id: 'client_mobile',
        type: 'cleanNode',
        position: { x: 525, y: 65 },
        data: rawComponents.find(c => c.id === 'client_mobile')!
      },
      {
        id: 'client_admin',
        type: 'cleanNode',
        position: { x: 770, y: 65 },
        data: rawComponents.find(c => c.id === 'client_admin')!
      },

      // --- LAYER 2: ENTRY & SECURITY (Centered 2 nodes) ---
      {
        id: 'api_gateway',
        type: 'cleanNode',
        position: { x: 390, y: 195 },
        data: rawComponents.find(c => c.id === 'api_gateway')!
      },
      {
        id: 'auth_service',
        type: 'cleanNode',
        position: { x: 660, y: 195 },
        data: rawComponents.find(c => c.id === 'auth_service')!
      },

      // --- LAYER 3: CORE APPLICATION SERVICES (6 nodes in 2 rows of 3) ---
      // Row 1
      {
        id: 'product_service',
        type: 'cleanNode',
        position: { x: 280, y: 365 },
        data: rawComponents.find(c => c.id === 'product_service')!
      },
      {
        id: 'cart_service',
        type: 'cleanNode',
        position: { x: 525, y: 365 },
        data: rawComponents.find(c => c.id === 'cart_service')!
      },
      {
        id: 'order_service',
        type: 'cleanNode',
        position: { x: 770, y: 365 },
        data: rawComponents.find(c => c.id === 'order_service')!
      },
      // Row 2
      {
        id: 'payment_service',
        type: 'cleanNode',
        position: { x: 280, y: 475 },
        data: rawComponents.find(c => c.id === 'payment_service')!
      },
      {
        id: 'inventory_service',
        type: 'cleanNode',
        position: { x: 525, y: 475 },
        data: rawComponents.find(c => c.id === 'inventory_service')!
      },
      {
        id: 'notification_service',
        type: 'cleanNode',
        position: { x: 770, y: 475 },
        data: rawComponents.find(c => c.id === 'notification_service')!
      },

      // --- LAYER 4: DATA LAYER (3 nodes side by side) ---
      {
        id: 'db_main',
        type: 'cleanNode',
        position: { x: 280, y: 610 },
        data: rawComponents.find(c => c.id === 'db_main')!
      },
      {
        id: 'cache_redis',
        type: 'cleanNode',
        position: { x: 525, y: 610 },
        data: rawComponents.find(c => c.id === 'cache_redis')!
      },
      {
        id: 'queue_broker',
        type: 'cleanNode',
        position: { x: 770, y: 610 },
        data: rawComponents.find(c => c.id === 'queue_broker')!
      },

      // --- LAYER 5: EXTERNAL INTEGRATIONS (3 nodes side by side) ---
      {
        id: 'ext_payment',
        type: 'cleanNode',
        position: { x: 280, y: 745 },
        data: rawComponents.find(c => c.id === 'ext_payment')!
      },
      {
        id: 'ext_notification',
        type: 'cleanNode',
        position: { x: 525, y: 745 },
        data: rawComponents.find(c => c.id === 'ext_notification')!
      },
      {
        id: 'ext_shipping',
        type: 'cleanNode',
        position: { x: 770, y: 745 },
        data: rawComponents.find(c => c.id === 'ext_shipping')!
      },

      // --- SUPPORTING COMPONENTS (Left and Right side columns) ---
      // Left Column
      {
        id: 'sup_security',
        type: 'cleanNode',
        position: { x: 30, y: 195 },
        data: rawComponents.find(c => c.id === 'sup_security')!
      },
      {
        id: 'sup_cloud',
        type: 'cleanNode',
        position: { x: 30, y: 475 },
        data: rawComponents.find(c => c.id === 'sup_cloud')!
      },
      // Right Column
      {
        id: 'sup_monitoring',
        type: 'cleanNode',
        position: { x: 1030, y: 365 },
        data: rawComponents.find(c => c.id === 'sup_monitoring')!
      }
    ];
  }, [rawComponents]);

  // Clean, uncluttered directional edges matching system flow
  const initialEdges: Edge[] = useMemo(() => {
    return [
      // 1. Layer 1 -> Layer 2 (Clients to API Gateway)
      {
        id: 'e_web_gw',
        source: 'client_web',
        target: 'api_gateway',
        label: 'HTTPS / TLS 1.3',
        animated: true,
        style: { stroke: '#9C381E', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#9C381E' }
      },
      {
        id: 'e_mobile_gw',
        source: 'client_mobile',
        target: 'api_gateway',
        style: { stroke: '#9C381E', strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#9C381E' }
      },
      {
        id: 'e_admin_gw',
        source: 'client_admin',
        target: 'api_gateway',
        style: { stroke: '#9C381E', strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#9C381E' }
      },

      // Security side connection to Gateway
      {
        id: 'e_sec_gw',
        source: 'sup_security',
        target: 'api_gateway',
        label: 'WAF Filter',
        style: { stroke: '#5C574C', strokeWidth: 1.5, strokeDasharray: '3 3' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#5C574C' }
      },

      // Gateway <-> Auth Service
      {
        id: 'e_gw_auth',
        source: 'api_gateway',
        target: 'auth_service',
        label: 'JWT Verify',
        style: { stroke: '#E06D3B', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#E06D3B' }
      },

      // 2. Layer 2 -> Layer 3 (Gateway dispatch to Application Services)
      {
        id: 'e_gw_product',
        source: 'api_gateway',
        target: 'product_service',
        label: 'Catalog Read',
        style: { stroke: '#2D5A43', strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#2D5A43' }
      },
      {
        id: 'e_gw_cart',
        source: 'api_gateway',
        target: 'cart_service',
        style: { stroke: '#2D5A43', strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#2D5A43' }
      },
      {
        id: 'e_gw_order',
        source: 'api_gateway',
        target: 'order_service',
        label: 'Checkout',
        style: { stroke: '#9C381E', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#9C381E' }
      },

      // 3. Service-to-Service Internal Orchestration
      {
        id: 'e_cart_order',
        source: 'cart_service',
        target: 'order_service',
        label: 'Submit Cart',
        style: { stroke: '#2D5A43', strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#2D5A43' }
      },
      {
        id: 'e_order_payment',
        source: 'order_service',
        target: 'payment_service',
        label: 'Capture Payment',
        style: { stroke: '#9C381E', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#9C381E' }
      },
      {
        id: 'e_order_inv',
        source: 'order_service',
        target: 'inventory_service',
        label: 'Deduct Stock',
        style: { stroke: '#E06D3B', strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#E06D3B' }
      },

      // 4. Services -> Data Layer
      {
        id: 'e_product_cache',
        source: 'product_service',
        target: 'cache_redis',
        label: 'Fast Cache (<2ms)',
        style: { stroke: '#2D5A43', strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#2D5A43' }
      },
      {
        id: 'e_inv_db',
        source: 'inventory_service',
        target: 'db_main',
        label: 'Row Lock (SELECT FOR UPDATE)',
        style: { stroke: '#1B4B66', strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#1B4B66' }
      },
      {
        id: 'e_order_db',
        source: 'order_service',
        target: 'db_main',
        label: 'ACID Ledger',
        style: { stroke: '#1B4B66', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#1B4B66' }
      },
      {
        id: 'e_order_queue',
        source: 'order_service',
        target: 'queue_broker',
        label: 'Publish OrderPaid',
        style: { stroke: '#1B4B66', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#1B4B66' }
      },
      {
        id: 'e_queue_notify',
        source: 'queue_broker',
        target: 'notification_service',
        label: 'Async Worker',
        animated: true,
        style: { stroke: '#2D5A43', strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#2D5A43' }
      },

      // 5. Services -> External Integrations
      {
        id: 'e_pay_ext',
        source: 'payment_service',
        target: 'ext_payment',
        label: '3D-Secure API',
        style: { stroke: '#C95B2A', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#C95B2A' }
      },
      {
        id: 'e_notify_ext',
        source: 'notification_service',
        target: 'ext_notification',
        label: 'Email / SMS Dispatch',
        style: { stroke: '#C95B2A', strokeWidth: 1.5, strokeDasharray: '3 3' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#C95B2A' }
      },
      {
        id: 'e_order_shipping',
        source: 'order_service',
        target: 'ext_shipping',
        label: 'Courier Label API',
        style: { stroke: '#C95B2A', strokeWidth: 1.5, strokeDasharray: '3 3' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#C95B2A' }
      },

      // Supporting Telemetry Connections
      {
        id: 'e_db_monitoring',
        source: 'db_main',
        target: 'sup_monitoring',
        style: { stroke: '#5C574C', strokeWidth: 1, strokeDasharray: '3 3' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#5C574C' }
      },
      {
        id: 'e_cloud_monitoring',
        source: 'sup_cloud',
        target: 'sup_monitoring',
        style: { stroke: '#5C574C', strokeWidth: 1, strokeDasharray: '3 3' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#5C574C' }
      }
    ];
  }, []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Dynamic Connection Highlighting on Click
  const highlightedEdges = useMemo(() => {
    if (!selectedNodeData) return edges;

    return edges.map(edge => {
      const isConnected = edge.source === selectedNodeData.id || edge.target === selectedNodeData.id;
      if (isConnected) {
        return {
          ...edge,
          animated: true,
          style: { ...edge.style, stroke: '#9C381E', strokeWidth: 3 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#9C381E' }
        };
      }
      return {
        ...edge,
        style: { ...edge.style, opacity: 0.2 }
      };
    });
  }, [edges, selectedNodeData]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (node.type === 'cleanNode') {
      setSelectedNodeData(node.data as unknown as CleanNodeData);
    }
  }, []);

  // Export handlers
  const handleExportJSON = () => {
    const exportData = {
      project: "NEXORA AI",
      architecture_style: "Clean Layered Microservices with Asynchronous Broker",
      version: projectVersion,
      generated_at: new Date().toISOString(),
      components: rawComponents,
      connections: initialEdges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        interaction: e.label || 'Default Data Link'
      }))
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const anchor = document.createElement('a');
    anchor.setAttribute("href", dataStr);
    anchor.setAttribute("download", `nexora_architecture_v${projectVersion}.json`);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const handleExportSVG = () => {
    const svgElem = containerRef.current?.querySelector('.react-flow__viewport');
    if (!svgElem) return;
    const serializer = new XMLSerializer();
    const source = `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="950">${serializer.serializeToString(svgElem)}</svg>`;
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nexora_architecture_flowchart_v${projectVersion}.svg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className={`space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-[#F8F5EE] p-6 overflow-y-auto' : ''}`}>
      {/* 1. PROFESSIONAL DIAGRAM HEADER & CONTROLS */}
      <div className="bg-white border border-[#DFD9CD] rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Title & Description */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-[#9C381E] font-['Space_Grotesk'] tracking-wider uppercase">
                System Architecture Flowchart
              </span>
              <span className="text-[10px] bg-[#2D5A43]/10 text-[#2D5A43] font-bold px-2 py-0.5 rounded-full font-mono">
                v{projectVersion}.0 • Clean Layered Model
              </span>
            </div>
            <p className="text-xs text-[#716C5F] mt-0.5 max-w-xl">
              Clean 5-layer architecture generated from extracted stakeholder requirements and AI-selected technology stack.
            </p>
          </div>

          {/* View Tabs */}
          <div className="flex items-center bg-[#FAF8F5] p-1 rounded-xl border border-[#DFD9CD]">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'overview'
                  ? 'bg-[#1E232A] text-white shadow-xs'
                  : 'text-[#5C574C] hover:text-[#1E232A]'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('components')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'components'
                  ? 'bg-[#1E232A] text-white shadow-xs'
                  : 'text-[#5C574C] hover:text-[#1E232A]'
              }`}
            >
              Components ({rawComponents.length})
            </button>
            <button
              onClick={() => setActiveTab('data_flow')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'data_flow'
                  ? 'bg-[#1E232A] text-white shadow-xs'
                  : 'text-[#5C574C] hover:text-[#1E232A]'
              }`}
            >
              Data Flow
            </button>
          </div>

          {/* Action & Canvas Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => zoomIn()}
              className="p-2 bg-[#FAF8F5] hover:bg-[#EAE4D7] border border-[#DFD9CD] rounded-xl text-[#5C574C] transition-all"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => zoomOut()}
              className="p-2 bg-[#FAF8F5] hover:bg-[#EAE4D7] border border-[#DFD9CD] rounded-xl text-[#5C574C] transition-all"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => fitView({ padding: 0.1 })}
              className="px-3 py-2 bg-[#FAF8F5] hover:bg-[#EAE4D7] border border-[#DFD9CD] rounded-xl text-xs font-bold text-[#1E232A] flex items-center gap-1.5 transition-all"
              title="Fit to Screen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              Fit Screen
            </button>
            <button
              onClick={handleExportSVG}
              className="px-3 py-2 bg-[#FAF8F5] hover:bg-[#EAE4D7] border border-[#DFD9CD] rounded-xl text-xs font-bold text-[#1E232A] flex items-center gap-1.5 transition-all"
              title="Download Diagram"
            >
              <Download className="w-3.5 h-3.5" />
              Download Diagram
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="px-3 py-2 bg-[#9C381E] hover:bg-[#802D18] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </button>
          </div>
        </div>

        {/* Informative Legend Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-[#F2ECE1] text-[11px]">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-[#9C381E] inline-block" />
              <span className="text-[#5C574C] font-semibold">Primary Data Flow</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 border-b border-dashed border-[#5C574C] inline-block" />
              <span className="text-[#5C574C] font-semibold">Optional / Event Flow</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#1E3A5F] inline-block" />
              <span className="text-[#5C574C]">User & Clients</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#9C381E] inline-block" />
              <span className="text-[#5C574C]">Entry & Security</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#2D5A43] inline-block" />
              <span className="text-[#5C574C]">Service Layer</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#1B4B66] inline-block" />
              <span className="text-[#5C574C]">Data Layer</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#C95B2A] inline-block" />
              <span className="text-[#5C574C]">External Services</span>
            </div>
          </div>

          <button
            onClick={handleExportJSON}
            className="text-[#9C381E] font-bold hover:underline flex items-center gap-1"
          >
            Export JSON Schema <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 2. MAIN FLOWCHART CANVAS */}
      <div 
        ref={containerRef}
        className={`w-full ${isFullscreen ? 'h-[85vh]' : 'h-[620px]'} bg-[#FAF8F5] border border-[#DFD9CD] rounded-3xl relative overflow-hidden shadow-inner`}
      >
        <ReactFlow
          nodes={nodes}
          edges={highlightedEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.08 }}
          minZoom={0.3}
          maxZoom={1.6}
          proOptions={{ hideAttribution: true }}
        >
          {/* Warm dots texture */}
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={24} 
            size={1.2} 
            color="#DCD4C5" 
          />

          {/* Canvas Controls */}
          <Controls 
            className="!bg-white !border !border-[#DFD9CD] !rounded-2xl !shadow-md !overflow-hidden"
          />

          {/* Clean Minimap */}
          <MiniMap 
            zoomable 
            pannable 
            nodeColor={(n: any) => {
              if (n.type === 'groupNode') return 'transparent';
              switch (n.data?.category) {
                case 'client': return '#1E3A5F';
                case 'gateway': return '#9C381E';
                case 'service': return '#2D5A43';
                case 'data': return '#1B4B66';
                case 'integration': return '#C95B2A';
                default: return '#5C574C';
              }
            }}
            className="!bg-white/90 !border !border-[#DFD9CD] !rounded-2xl !shadow-md"
            maskColor="rgba(248, 245, 238, 0.7)"
          />
        </ReactFlow>
      </div>

      {/* 3. ARCHITECTURE SUMMARY FOOTER */}
      <div className="bg-white border border-[#DFD9CD] rounded-2xl p-5 shadow-sm space-y-2">
        <h4 className="text-xs font-bold text-[#1E232A] uppercase tracking-wider font-['Space_Grotesk'] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#2D5A43]" />
          Architecture Summary & Design Characteristics
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#5C574C] pt-1">
          <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#DFD9CD]">
            <span className="font-bold text-[#1E232A]">Scalability & Concurrency: </span>
            Sub-20ms reads powered by Redis cluster caching, read replicas, and horizontal pod autoscaling under Kubernetes.
          </div>
          <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#DFD9CD]">
            <span className="font-bold text-[#1E232A]">Transactional Consistency: </span>
            Zero race-condition inventory overselling via row-level locks (SELECT FOR UPDATE) and distributed Redlock.
          </div>
          <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#DFD9CD]">
            <span className="font-bold text-[#1E232A]">Decoupled Fault Tolerance: </span>
            RabbitMQ / Kafka event bus guarantees asynchronous payment settlement, email receipts, and dead-letter retry safety.
          </div>
        </div>
      </div>

      {/* 4. COMPONENT INFORMATION INSPECTION PANEL VIA MODALPORTAL */}
      <ModalPortal
        isOpen={!!selectedNodeData}
        onClose={() => setSelectedNodeData(null)}
        maxWidth="max-w-xl"
      >
        {selectedNodeData && (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#9C381E]/10 text-[#9C381E]">
                  Component Inspector
                </span>
                <h3 className="text-lg font-bold text-[#1E232A] mt-1 font-['Space_Grotesk']">
                  {selectedNodeData.title}
                </h3>
                <div className="text-xs font-mono text-[#5C574C] font-semibold mt-0.5">
                  Technology: <span className="text-[#9C381E] font-bold">{selectedNodeData.tech}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedNodeData(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Details */}
            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#DFD9CD]">
                <div className="font-bold text-[#1E232A] mb-1">Architectural Role & Purpose</div>
                <div className="text-[#5C574C] leading-relaxed">{selectedNodeData.role}</div>
              </div>

              <div>
                <div className="font-bold text-[#1E232A] mb-1.5">Key Responsibilities:</div>
                <ul className="space-y-1">
                  {selectedNodeData.responsibilities?.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-[#5C574C]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2D5A43] shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 bg-[#FFF5F2] border border-[#F2C4B3] rounded-xl">
                <div className="font-bold text-[#9C381E] flex items-center gap-1.5 mb-1">
                  <Shield className="w-3.5 h-3.5 text-[#9C381E]" /> Security Considerations & Mitigation
                </div>
                <div className="text-xs text-[#5C574C]">{selectedNodeData.securityNote}</div>
              </div>

              <div>
                <div className="font-bold text-[#1E232A] mb-1">Connected Upstream / Downstream Components:</div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedNodeData.connections?.map((c, i) => (
                    <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-700 font-mono text-[10px] rounded-md font-bold">
                      {c.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button 
              onClick={() => setSelectedNodeData(null)}
              className="w-full py-2.5 bg-[#1E232A] hover:bg-[#2F3642] text-white rounded-xl text-xs font-bold transition-all"
            >
              Close Component Inspector
            </button>
          </div>
        )}
      </ModalPortal>
    </div>
  );
}

export function VisualArchitectureDiagram(props: VisualArchitectureDiagramProps) {
  return (
    <ReactFlowProvider>
      <FlowCanvas {...props} />
    </ReactFlowProvider>
  );
}
