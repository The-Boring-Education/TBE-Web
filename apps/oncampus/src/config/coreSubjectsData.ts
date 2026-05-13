export type ChapterContent = {
  overview: string;
  notes: string[];
  importantPoints: string[];
  interviewQuestions: { q: string; a: string }[];
  codeBlock?: string;
};

export type Chapter = {
  id: string;
  title: string;
  description: string;
  content: ChapterContent;
};

export type Subject = {
  id: string;
  label: string;
  chapters: Chapter[];
};

export const CORE_SUBJECTS: Subject[] = [
  {
    id: "oops",
    label: "OOPS",
    chapters: [
      {
        id: "oops-1",
        title: "Classes & Objects",
        description:
          "Understand the blueprint (class) and instances (objects) that form the foundation of OOP.",
        content: {
          overview:
            "A class is a user-defined blueprint from which objects are created. An object is an instance of a class that holds actual data and can perform actions via methods.",
          notes: [
            "A class defines attributes (fields) and behaviours (methods).",
            "Objects are created using the `new` keyword in most OOP languages.",
            "Each object has its own copy of instance variables.",
            "Static members belong to the class, not individual objects.",
          ],
          importantPoints: [
            "Class is a logical entity; object is a physical entity.",
            "Constructor initialises an object when it is created.",
            "Destructor (or garbage collector) cleans up when an object is no longer needed.",
          ],
          interviewQuestions: [
            {
              q: "What is the difference between a class and an object?",
              a: "A class is a template/blueprint; an object is an instance created from that blueprint with actual values.",
            },
            {
              q: "Can a class exist without any object?",
              a: "Yes – static classes or utility classes can be used without instantiation.",
            },
          ],
          codeBlock: `// Java example\nclass Car {\n  String brand;\n  int speed;\n  Car(String b, int s) { brand = b; speed = s; }\n  void display() { System.out.println(brand + \" @ \" + speed + \"kmph\"); }\n}\npublic class Main {\n  public static void main(String[] args) {\n    Car c = new Car(\"Tesla\", 200);\n    c.display();\n  }\n}`,
        },
      },
      {
        id: "oops-2",
        title: "Inheritance",
        description:
          "Reuse and extend existing class behaviour through parent-child relationships.",
        content: {
          overview:
            "Inheritance allows a child class to acquire the properties and behaviours of a parent class, promoting code reuse and establishing an IS-A relationship.",
          notes: [
            "Single, multilevel, hierarchical, multiple (via interfaces) inheritance types exist.",
            "The `extends` keyword is used in Java; `:` in C++/C#.",
            "Method overriding enables runtime polymorphism.",
            "`super` keyword accesses the parent class constructor or method.",
          ],
          importantPoints: [
            "Inheritance models IS-A relationship.",
            "Java does not support multiple inheritance through classes to avoid the diamond problem.",
            "Abstract classes can be partially implemented and inherited.",
          ],
          interviewQuestions: [
            {
              q: "What is the diamond problem?",
              a: "When a class inherits from two classes that both inherit from the same base, ambiguity arises. Java avoids this by not allowing multiple class inheritance.",
            },
            {
              q: "Difference between method overloading and overriding?",
              a: "Overloading is compile-time (same name, different params); overriding is runtime (child redefines parent method).",
            },
          ],
        },
      },
      {
        id: "oops-3",
        title: "Polymorphism",
        description:
          "One interface, many implementations — compile-time and runtime forms.",
        content: {
          overview:
            "Polymorphism means 'many forms'. It allows a single interface to represent different underlying data types or methods.",
          notes: [
            "Compile-time polymorphism: method overloading, operator overloading.",
            "Runtime polymorphism: method overriding via virtual functions.",
            "Dynamic dispatch selects the correct method at runtime.",
          ],
          importantPoints: [
            "Runtime polymorphism is achieved through inheritance and interfaces.",
            "Virtual functions (C++) / abstract methods (Java) enable dynamic dispatch.",
          ],
          interviewQuestions: [
            {
              q: "What is dynamic method dispatch?",
              a: "A mechanism where a call to an overridden method is resolved at runtime rather than compile time.",
            },
          ],
        },
      },
      {
        id: "oops-4",
        title: "Encapsulation",
        description:
          "Bundle data and methods; restrict direct access using access modifiers.",
        content: {
          overview:
            "Encapsulation hides internal state and requires all interaction to be performed through an object's methods, improving security and maintainability.",
          notes: [
            "Use `private` fields with public getters/setters.",
            "Reduces interdependencies between components.",
            "Makes code easier to maintain and test.",
          ],
          importantPoints: [
            "Data hiding is a key benefit of encapsulation.",
            "JavaBeans convention uses getX()/setX() patterns.",
          ],
          interviewQuestions: [
            {
              q: "How is encapsulation different from abstraction?",
              a: "Encapsulation hides data (HOW); abstraction hides complexity (WHAT). Encapsulation is implemented via access modifiers; abstraction via abstract classes/interfaces.",
            },
          ],
        },
      },
      {
        id: "oops-5",
        title: "Abstraction",
        description:
          "Expose only what is necessary; hide implementation details.",
        content: {
          overview:
            "Abstraction focuses on exposing only the relevant features of an object while hiding the complex implementation behind a simple interface.",
          notes: [
            "Achieved via abstract classes and interfaces.",
            "Interfaces define a contract without implementation (before Java 8).",
            "Abstract classes can have both concrete and abstract methods.",
          ],
          importantPoints: [
            "Abstraction reduces programming complexity.",
            "An interface can be implemented by multiple unrelated classes.",
          ],
          interviewQuestions: [
            {
              q: "Can we instantiate an abstract class?",
              a: "No. Abstract classes cannot be instantiated directly; they must be subclassed.",
            },
          ],
        },
      },
      {
        id: "oops-6",
        title: "Interfaces",
        description:
          "Define contracts that classes must fulfill, enabling multiple inheritance.",
        content: {
          overview:
            "An interface is a reference type in Java that contains only abstract methods (and constants). A class implements an interface, agreeing to provide implementations for all its methods.",
          notes: [
            "Java 8+ allows default and static methods in interfaces.",
            "A class can implement multiple interfaces.",
            "Interfaces support loose coupling.",
          ],
          importantPoints: [
            "All interface methods are implicitly public and abstract (before Java 8).",
            "Functional interfaces have exactly one abstract method and support lambdas.",
          ],
          interviewQuestions: [
            {
              q: "Difference between abstract class and interface?",
              a: "Abstract class can have state and partial implementation; interface is a pure contract. A class can extend only one abstract class but implement many interfaces.",
            },
          ],
        },
      },
    ],
  },
  {
    id: "dbms",
    label: "DBMS",
    chapters: [
      {
        id: "dbms-1",
        title: "Introduction to DBMS",
        description:
          "Core concepts of database management systems and why they exist.",
        content: {
          overview:
            "A Database Management System (DBMS) is software that interacts with users, applications, and the database itself to capture and analyse data.",
          notes: [
            "DBMS provides data abstraction through three schema levels: external, conceptual, internal.",
            "It ensures data independence — logical and physical.",
            "Common DBMS: MySQL, PostgreSQL, Oracle, MongoDB.",
          ],
          importantPoints: [
            "DBMS eliminates data redundancy and ensures consistency.",
            "It provides concurrent access and crash recovery.",
          ],
          interviewQuestions: [
            {
              q: "What is the difference between DBMS and RDBMS?",
              a: "RDBMS stores data in relational tables with defined relationships; DBMS can store data in any form (hierarchical, network, etc.).",
            },
          ],
        },
      },
      {
        id: "dbms-2",
        title: "ER Model",
        description:
          "Entity-Relationship diagrams to design database schema visually.",
        content: {
          overview:
            "The ER model is a conceptual data model that describes the structure of a database using entities, attributes, and relationships.",
          notes: [
            "Entity: a real-world object (e.g., Student).",
            "Attribute: property of an entity (e.g., Name).",
            "Relationship: association between entities (e.g., Enrolled-In).",
            "Cardinality: 1:1, 1:N, M:N.",
          ],
          importantPoints: [
            "Weak entities depend on a strong entity and have a partial key.",
            "Participation constraints: total (double line) vs partial (single line).",
          ],
          interviewQuestions: [
            {
              q: "What is a weak entity?",
              a: "An entity that cannot be uniquely identified by its own attributes alone; it depends on a strong entity.",
            },
          ],
        },
      },
      {
        id: "dbms-3",
        title: "Normalization",
        description:
          "Eliminate redundancy and anomalies through structured normal forms.",
        content: {
          overview:
            "Normalization is the process of organising a database to reduce redundancy and improve data integrity by dividing tables and defining relationships.",
          notes: [
            "1NF: atomic values, no repeating groups.",
            "2NF: 1NF + no partial dependency.",
            "3NF: 2NF + no transitive dependency.",
            "BCNF: stronger version of 3NF.",
          ],
          importantPoints: [
            "Denormalization trades redundancy for read performance.",
            "Functional dependency X→Y means X determines Y.",
          ],
          interviewQuestions: [
            {
              q: "What is a transitive dependency?",
              a: "When a non-key attribute depends on another non-key attribute: A→B and B→C implies A→C transitively.",
            },
          ],
        },
      },
      {
        id: "dbms-4",
        title: "Transactions",
        description:
          "ACID properties and concurrency control in database operations.",
        content: {
          overview:
            "A transaction is a unit of work that either completes fully or not at all, maintaining database consistency.",
          notes: [
            "ACID: Atomicity, Consistency, Isolation, Durability.",
            "Concurrency issues: dirty read, non-repeatable read, phantom read.",
            "Isolation levels: Read Uncommitted, Read Committed, Repeatable Read, Serializable.",
          ],
          importantPoints: [
            "Rollback undoes incomplete transactions after a failure.",
            "Two-phase locking (2PL) ensures serializability.",
          ],
          interviewQuestions: [
            {
              q: "What is a deadlock in DBMS?",
              a: "When two or more transactions wait indefinitely for each other to release locks.",
            },
          ],
        },
      },
      {
        id: "dbms-5",
        title: "Indexing",
        description:
          "Speed up data retrieval using B-trees, hash indexes, and more.",
        content: {
          overview:
            "Indexing creates a data structure (index) that allows the database engine to locate rows quickly without scanning the entire table.",
          notes: [
            "Primary index on ordered key field; secondary index on non-key.",
            "Dense index: entry for every record; sparse: entry for each block.",
            "B+ Tree is the most common index structure in RDBMS.",
          ],
          importantPoints: [
            "Index speeds up reads but slows down writes.",
            "Composite index covers multiple columns.",
          ],
          interviewQuestions: [
            {
              q: "Difference between clustered and non-clustered index?",
              a: "Clustered: data rows stored in index order (one per table). Non-clustered: separate structure pointing to rows.",
            },
          ],
        },
      },
      {
        id: "dbms-6",
        title: "SQL Basics",
        description: "Master DDL, DML, DCL, and common SQL query patterns.",
        content: {
          overview:
            "SQL (Structured Query Language) is the standard language for interacting with relational databases — creating schema, inserting, querying, and managing data.",
          notes: [
            "DDL: CREATE, ALTER, DROP, TRUNCATE.",
            "DML: SELECT, INSERT, UPDATE, DELETE.",
            "DCL: GRANT, REVOKE.",
            "Joins: INNER, LEFT, RIGHT, FULL OUTER, CROSS, SELF.",
          ],
          importantPoints: [
            "GROUP BY + HAVING filters aggregated results.",
            "Subqueries and CTEs improve query readability.",
          ],
          interviewQuestions: [
            {
              q: "Difference between WHERE and HAVING?",
              a: "WHERE filters rows before grouping; HAVING filters groups after GROUP BY.",
            },
          ],
          codeBlock: `-- Top 3 departments by average salary\nSELECT dept, AVG(salary) AS avg_sal\nFROM employees\nGROUP BY dept\nORDER BY avg_sal DESC\nLIMIT 3;`,
        },
      },
    ],
  },
  {
    id: "os",
    label: "Operating System",
    chapters: [
      {
        id: "os-1",
        title: "Introduction to OS",
        description:
          "Role of OS as resource manager and interface between hardware and software.",
        content: {
          overview:
            "An Operating System is system software that manages hardware resources and provides common services for computer programs.",
          notes: [
            "Functions: process management, memory management, file system, I/O management.",
            "Types: batch, time-sharing, real-time, distributed, embedded.",
            "Kernel is the core of the OS; it runs in privileged mode.",
          ],
          importantPoints: [
            "System calls are the API between user programs and the OS.",
            "Monolithic vs microkernel architecture trade-offs.",
          ],
          interviewQuestions: [
            {
              q: "What is the difference between a process and a thread?",
              a: "A process is an independent program in execution with its own memory; a thread is a lightweight unit within a process sharing the same memory space.",
            },
          ],
        },
      },
      {
        id: "os-2",
        title: "Process Scheduling",
        description: "CPU scheduling algorithms and their performance metrics.",
        content: {
          overview:
            "Process scheduling determines which process runs on the CPU at any given time to maximise utilisation and minimise wait time.",
          notes: [
            "FCFS: simple, non-preemptive, convoy effect.",
            "SJF: optimal average wait time, starvation possible.",
            "Round Robin: preemptive, fair, time quantum based.",
            "Priority Scheduling: can lead to starvation; aging fixes it.",
          ],
          importantPoints: [
            "Turnaround time = completion − arrival; waiting time = turnaround − burst.",
            "Multilevel queue scheduling combines multiple algorithms.",
          ],
          interviewQuestions: [
            {
              q: "What is starvation and how is aging used to prevent it?",
              a: "Starvation occurs when low-priority processes never get CPU time. Aging gradually increases the priority of waiting processes over time.",
            },
          ],
        },
      },
      {
        id: "os-3",
        title: "Memory Management",
        description: "Paging, segmentation, and virtual memory concepts.",
        content: {
          overview:
            "Memory management controls how primary memory is allocated, tracked, and reclaimed among competing processes.",
          notes: [
            "Paging: fixed-size frames; eliminates external fragmentation.",
            "Segmentation: variable-size segments; logical division of a program.",
            "Virtual memory allows execution of programs larger than physical RAM.",
            "Page replacement: FIFO, LRU, Optimal.",
          ],
          importantPoints: [
            "TLB (Translation Lookaside Buffer) speeds up page table lookups.",
            "Thrashing: excessive paging degrades performance.",
          ],
          interviewQuestions: [
            {
              q: "What is a page fault?",
              a: "When a process accesses a page not currently in physical memory, triggering the OS to load it from disk.",
            },
          ],
        },
      },
      {
        id: "os-4",
        title: "Deadlocks",
        description:
          "Detection, prevention, and avoidance of deadlocks in concurrent systems.",
        content: {
          overview:
            "A deadlock is a state where a set of processes are blocked, each waiting for a resource held by another process in the set.",
          notes: [
            "Necessary conditions (Coffman): Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait.",
            "Banker's Algorithm: deadlock avoidance by checking safe states.",
            "Detection: resource allocation graph; Recovery: preemption or rollback.",
          ],
          importantPoints: [
            "Breaking any one Coffman condition prevents deadlock.",
            "Deadlock prevention is conservative; avoidance is less restrictive.",
          ],
          interviewQuestions: [
            {
              q: "Explain Banker's Algorithm.",
              a: "It simulates resource allocation and checks whether the system remains in a safe state after each allocation. If unsafe, the request is denied.",
            },
          ],
        },
      },
      {
        id: "os-5",
        title: "File Systems",
        description:
          "File organisation, directory structures, and disk scheduling.",
        content: {
          overview:
            "A file system defines how data is stored and retrieved on storage devices. It manages files, directories, and access control.",
          notes: [
            "File allocation: contiguous, linked, indexed.",
            "Directory structures: single-level, two-level, tree, graph.",
            "Disk scheduling: FCFS, SSTF, SCAN, C-SCAN.",
          ],
          importantPoints: [
            "Inode stores file metadata in Unix-based systems.",
            "Journaling file systems (ext4, NTFS) improve crash recovery.",
          ],
          interviewQuestions: [
            {
              q: "What is an inode?",
              a: "A data structure that stores metadata about a file (permissions, size, timestamps, block pointers) but not the filename.",
            },
          ],
        },
      },
    ],
  },
  {
    id: "system-design",
    label: "System Design",
    chapters: [
      {
        id: "sd-1",
        title: "Scalability Basics",
        description:
          "Horizontal vs vertical scaling and strategies to handle growth.",
        content: {
          overview:
            "Scalability is the ability of a system to handle increased load by adding resources. Understanding scaling strategies is essential for designing large-scale systems.",
          notes: [
            "Vertical scaling: add more power to a single machine (CPU, RAM).",
            "Horizontal scaling: add more machines; requires load balancing.",
            "Stateless services scale horizontally more easily.",
          ],
          importantPoints: [
            "CAP theorem: Consistency, Availability, Partition Tolerance — pick two.",
            "Sharding distributes data across multiple databases.",
          ],
          interviewQuestions: [
            {
              q: "When would you choose horizontal over vertical scaling?",
              a: "When you need fault tolerance and cost-effective growth; horizontal scaling provides redundancy and can scale indefinitely with commodity hardware.",
            },
          ],
        },
      },
      {
        id: "sd-2",
        title: "Load Balancing",
        description:
          "Distribute traffic efficiently across servers to prevent bottlenecks.",
        content: {
          overview:
            "A load balancer distributes incoming network traffic across multiple servers to ensure no single server bears too much demand.",
          notes: [
            "Algorithms: Round Robin, Least Connections, IP Hash, Weighted Round Robin.",
            "Layer 4 (transport) vs Layer 7 (application) load balancing.",
            "Health checks remove unhealthy nodes from the pool automatically.",
          ],
          importantPoints: [
            "Sticky sessions maintain user session on the same server.",
            "DNS-based load balancing distributes at the DNS resolution level.",
          ],
          interviewQuestions: [
            {
              q: "What is the difference between L4 and L7 load balancing?",
              a: "L4 routes based on IP/TCP; L7 routes based on HTTP headers, URLs, cookies — more intelligent but adds latency.",
            },
          ],
        },
      },
      {
        id: "sd-3",
        title: "Caching",
        description:
          "Speed up systems using in-memory caches and cache invalidation strategies.",
        content: {
          overview:
            "Caching stores frequently accessed data in fast storage (memory) to reduce latency and backend load.",
          notes: [
            "Cache-aside, read-through, write-through, write-back patterns.",
            "Eviction policies: LRU, LFU, FIFO.",
            "Distributed caches: Redis, Memcached.",
          ],
          importantPoints: [
            "Cache invalidation is one of the hardest problems in CS.",
            "Cache stampede (thundering herd) occurs when cache expires simultaneously.",
          ],
          interviewQuestions: [
            {
              q: "What is a cache stampede and how do you prevent it?",
              a: "When many requests hit the backend simultaneously after a cache miss. Prevent with probabilistic early expiration, mutex locks, or background refresh.",
            },
          ],
        },
      },
      {
        id: "sd-4",
        title: "Databases in System Design",
        description: "SQL vs NoSQL trade-offs and when to choose which.",
        content: {
          overview:
            "Choosing the right database type is a critical system design decision that impacts consistency, scalability, and query flexibility.",
          notes: [
            "SQL: structured, ACID, vertical scaling, relational joins.",
            "NoSQL types: document (MongoDB), key-value (Redis), columnar (Cassandra), graph (Neo4j).",
            "BASE: Basically Available, Soft state, Eventual consistency.",
          ],
          importantPoints: [
            "Polyglot persistence uses multiple database types in one system.",
            "Read replicas offload read traffic from the primary database.",
          ],
          interviewQuestions: [
            {
              q: "When would you use a NoSQL database over SQL?",
              a: "For unstructured or semi-structured data, high write throughput, horizontal scalability needs, or flexible schema requirements.",
            },
          ],
        },
      },
      {
        id: "sd-5",
        title: "Microservices",
        description:
          "Decompose monoliths into independent, deployable services.",
        content: {
          overview:
            "Microservices architecture structures an application as a collection of loosely coupled, independently deployable services each responsible for a specific business capability.",
          notes: [
            "Services communicate via REST, gRPC, or message queues.",
            "Service discovery: Consul, Eureka, Kubernetes DNS.",
            "API Gateway acts as single entry point for clients.",
            "Circuit breaker pattern prevents cascade failures.",
          ],
          importantPoints: [
            "Each microservice should own its data store.",
            "Distributed tracing (Jaeger, Zipkin) is essential for debugging.",
          ],
          interviewQuestions: [
            {
              q: "What is the Circuit Breaker pattern?",
              a: "Stops calls to a failing service after a threshold, returns fallback responses, and retries after a timeout — preventing cascade failures.",
            },
          ],
        },
      },
      {
        id: "sd-6",
        title: "Designing for High Availability",
        description:
          "Redundancy, failover, and SLA strategies to minimise downtime.",
        content: {
          overview:
            "High availability (HA) ensures a system remains operational for a high percentage of time (e.g., 99.9% = ~8.7h downtime/year).",
          notes: [
            "SPOF (Single Point of Failure) elimination through redundancy.",
            "Active-passive vs active-active failover.",
            "Multi-region deployment for disaster recovery.",
          ],
          importantPoints: [
            "99.99% (four nines) = ~52 minutes downtime/year.",
            "Chaos engineering (Netflix Chaos Monkey) tests resilience.",
          ],
          interviewQuestions: [
            {
              q: "What is the difference between RTO and RPO?",
              a: "RTO (Recovery Time Objective): max acceptable downtime. RPO (Recovery Point Objective): max acceptable data loss measured in time.",
            },
          ],
        },
      },
    ],
  },
  {
    id: "cn",
    label: "Computer Networks",
    chapters: [
      {
        id: "cn-1",
        title: "OSI & TCP/IP Model",
        description:
          "Seven-layer OSI model and four-layer TCP/IP model explained.",
        content: {
          overview:
            "The OSI model is a conceptual framework that standardises network communication into 7 layers. TCP/IP is the practical 4-layer model used on the Internet.",
          notes: [
            "OSI layers (top-down): Application, Presentation, Session, Transport, Network, Data Link, Physical.",
            "TCP/IP layers: Application, Transport, Internet, Network Access.",
            "Encapsulation adds headers as data moves down; decapsulation removes them going up.",
          ],
          importantPoints: [
            "Each layer communicates with the same layer on the remote host (peer-to-peer).",
            "PDU names: segment (transport), packet (network), frame (data link), bit (physical).",
          ],
          interviewQuestions: [
            {
              q: "Why does the OSI model have 7 layers while TCP/IP has 4?",
              a: "OSI is a theoretical reference model with finer granularity. TCP/IP collapses application/presentation/session into one and physical/data link into one.",
            },
          ],
        },
      },
      {
        id: "cn-2",
        title: "TCP vs UDP",
        description:
          "Connection-oriented reliability vs connectionless speed — trade-offs explained.",
        content: {
          overview:
            "TCP and UDP are the two primary transport-layer protocols. TCP guarantees delivery and ordering; UDP trades reliability for speed.",
          notes: [
            "TCP: three-way handshake (SYN, SYN-ACK, ACK), flow control, congestion control.",
            "UDP: no connection setup, no guarantee, lower overhead.",
            "TCP use cases: HTTP/S, FTP, email. UDP: DNS, VoIP, gaming, video streaming.",
          ],
          importantPoints: [
            "TCP head-of-line blocking can cause latency spikes.",
            "QUIC (HTTP/3) builds reliability on top of UDP to overcome TCP limitations.",
          ],
          interviewQuestions: [
            {
              q: "When would you choose UDP over TCP?",
              a: "When low latency matters more than reliability — e.g., live video, online gaming, DNS — where occasional packet loss is acceptable.",
            },
          ],
        },
      },
      {
        id: "cn-3",
        title: "IP Addressing & Subnetting",
        description: "IPv4, IPv6, CIDR notation, and subnet calculations.",
        content: {
          overview:
            "IP addressing provides unique identifiers for devices on a network. Subnetting divides a network into smaller, manageable sub-networks.",
          notes: [
            "IPv4: 32-bit address, ~4.3B unique addresses.",
            "IPv6: 128-bit address, vastly larger address space.",
            "CIDR notation: 192.168.1.0/24 means 24 bits for network, 8 for hosts.",
            "Private ranges: 10.x.x.x, 172.16–31.x.x, 192.168.x.x.",
          ],
          importantPoints: [
            "Subnet mask determines network vs host portion.",
            "NAT allows multiple devices to share one public IP.",
          ],
          interviewQuestions: [
            {
              q: "How many hosts can a /26 subnet support?",
              a: "2^6 - 2 = 62 usable hosts (subtract network and broadcast addresses).",
            },
          ],
        },
      },
      {
        id: "cn-4",
        title: "HTTP & HTTPS",
        description: "Web protocol mechanics, status codes, and TLS handshake.",
        content: {
          overview:
            "HTTP (HyperText Transfer Protocol) is the foundation of data communication on the Web. HTTPS adds TLS encryption for security.",
          notes: [
            "HTTP methods: GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD.",
            "Status codes: 1xx informational, 2xx success, 3xx redirect, 4xx client error, 5xx server error.",
            "HTTP/2: multiplexing, header compression, server push.",
            "TLS handshake: cipher negotiation, certificate verification, key exchange.",
          ],
          importantPoints: [
            "HSTS forces browsers to use HTTPS.",
            "CORS headers control cross-origin resource sharing.",
          ],
          interviewQuestions: [
            {
              q: "What happens when you type a URL in the browser?",
              a: "DNS resolution → TCP connection → TLS handshake (HTTPS) → HTTP request sent → server processes → response returned → browser renders.",
            },
          ],
        },
      },
      {
        id: "cn-5",
        title: "DNS & CDN",
        description:
          "Domain resolution process and content delivery network architecture.",
        content: {
          overview:
            "DNS translates human-readable domain names into IP addresses. CDNs cache content at edge servers geographically close to users.",
          notes: [
            "DNS hierarchy: Root → TLD (.com) → Authoritative nameserver.",
            "DNS records: A, AAAA, CNAME, MX, TXT, NS.",
            "CDN benefits: reduced latency, DDoS protection, origin offload.",
          ],
          importantPoints: [
            "DNS TTL controls cache duration; low TTL enables faster propagation.",
            "Anycast routing directs requests to the nearest CDN PoP.",
          ],
          interviewQuestions: [
            {
              q: "What is the difference between authoritative and recursive DNS?",
              a: "Authoritative DNS holds the actual DNS records. Recursive (resolver) DNS queries on behalf of the client, caching results along the way.",
            },
          ],
        },
      },
    ],
  },
];
