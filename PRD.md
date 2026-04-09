# PRD.md
> Product Requirements Document.
> Last updated: 2026-04-09

---

## APP OVERVIEW

- **App name:** Chase Points Optimizer (working title)
- **One-liner:** A tool that helps Chase Ultimate Rewards cardholders understand the best ways to redeem their points across all major transfer partners
- **Primary user:** Chase cardholder with accumulated UR points who doesn't know how to maximise their value
- **Core problem:** Most Chase cardholders don't know points are worth more when transferred to partners

---

## USER STORIES

| ID | User Story | Priority | Status |
|---|---|---|---|
| US-001 | As a Chase cardholder, I want to enter my points balance so I can see what I can redeem for | High | Backlog |
| US-002 | As a Chase cardholder, I want redemption options ranked by value so I can make the best decision | High | Backlog |
| US-003 | As a Chase cardholder, I want AI recommendations so I get personalised suggestions | High | Backlog |
| US-004 | As a Chase cardholder, I want to filter by redemption type (flights, hotels, cash back) | Medium | Backlog |
| US-005 | As a Chase cardholder, I want to see cents-per-point value to compare options fairly | Medium | Backlog |

---

## FEATURES

### In Scope — v0.1

| ID | Feature | Description | Linked Story |
|---|---|---|---|
| F-001 | Points input | User enters Chase UR balance | US-001 |
| F-002 | Redemption options display | All major transfer partners + estimated value | US-002, US-005 |
| F-003 | Claude recommendations | AI-generated personalised suggestions | US-003 |
| F-004 | Redemption type filter | Filter by flights, hotels, cash back | US-004 |
| F-005 | Static partner data | Curated JSON of partners + CPP values | US-002 |

### Out of Scope — v0.1

| Feature | Reason | Revisit |
|---|---|---|
| Live loyalty APIs | No public APIs, high complexity | v1 |
| User accounts | No auth in v0.1 | v1 |
| Other card programs | Too broad for v0.1 | v1 |
| Real-time award availability | Requires live API | v1 |
| Mobile app | Web first | v2 |

### Backlog

| Feature | Notes |
|---|---|
| Amex Membership Rewards | After Chase v0.1 proven |
| Trip builder | Input destination, find best redemption path |
| Points valuation tracker | Track CPP changes over time |

---

## CONSTRAINTS

- Must not expose Claude API key client-side in production
- Must not show non-Chase programs in v0.1
- Must always show CPP value alongside every option
- Must always clarify values are estimates, not guarantees

---

## SUCCESS CRITERIA

- [ ] User can input Chase UR points balance
- [ ] All major Chase transfer partners shown with CPP values
- [ ] Claude returns personalised recommendation
- [ ] Results filterable by redemption type
- [ ] Deployed to Netlify from GitHub

---

## OPEN QUESTIONS

| Question | Raised | Resolved |
|---|---|---|
| Which transfer partners to include — needs research | 2026-04-09 | No |
| CPP values source — TPG, Wirecutter, etc. | 2026-04-09 | No |
