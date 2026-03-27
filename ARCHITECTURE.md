# ExpenseIQ Architecture Diagram

ExpenseIQ is built on the MERN stack (MongoDB, Express.js, React, Node.js), integrating sophisticated backend AI processing pipelines via REST APIs. 

Below is the systemic Mermaid flow covering the User's traversal from the Single Page Application (SPA), through to the Node runtime environment where the NLP and Isolation Forest machine learning tasks execute before reaching the MongoDB collections.

```mermaid
graph TD
    subgraph Frontend [React.js Client]
        UI[Dashboard UI]
        AuthUI[Login / Register]
        Form[Transaction Form]
        Charts[Recharts Visualizations]

        AuthUI --> UI
        Form --> UI
        Charts -.-> UI
    end

    subgraph API [Express.js Backend Layer]
        Router[API & Routing]
        Auth[JWT Middleware]
        UserCtrl[User Controller]
        TransCtrl[Transaction Controller]

        Router --> Auth
        Auth --> UserCtrl
        Auth --> TransCtrl
        Router --> TransCtrl
    end

    subgraph AI [Machine Learning Engine]
        NLP[Naive Bayes Categorizer]
        Forest[Isolation Forest Anomaly]

        TransCtrl -->|Raw Description Text| NLP
        NLP -->|Predicted Type/Category| TransCtrl
        TransCtrl -->|Historical Amounts| Forest
        Forest -->|Scored Outlier Boolean| TransCtrl
    end

    subgraph Database [MongoDB NoSQL Cluster]
        UserDB[(users)]
        TransDB[(transactions)]
        
        UserCtrl --> UserDB
        TransCtrl --> TransDB
    end

    UI ==>|HTTP Requests| Router
    Form -.->|GET /predict-category| Router
    Form ==>|POST /transactions| Router
```

## Scaling Strategy
The frontend is decoupled and deployable instantly on Vercel Native Edge routing. The backend Node server can be efficiently Dockerized to run on Render or AWS ECS due to its strictly stateless architecture and scalable standard JWT token verification patterns without requiring synchronized server memory caches.
