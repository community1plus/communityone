# Contact Engine

---

## Metadata

**Engine ID**
ENG-IDENTITY-CONTACT

**Version**
1.0

**Status**
Development

**Layer**
Engine

**Workspace**
Identity Workspace

**Owner**
Identity & Trust

---

## Purpose

Provide trusted contact management and verification for Community One identities.

---

## Design Rationale

Community One depends on trusted identities.

Trusted identities depend on verified contact information.

This Engine establishes that trust while deliberately excluding authentication and profile management in order to maintain a single responsibility.

Every capability implemented by this Engine can be explained and defended in terms of platform trust.

---

## Scope

### Owns

- Phone number management
- Contact preferences
- SMS verification
- Verification status
- Verification history

### Does NOT Own

- User Profile
- Authentication
- Authorisation
- Organisation Management
- Payment
- Identity Lifecycle

---

## Responsibilities

- Manage phone numbers
- Manage contact preferences
- Initiate SMS verification
- Validate verification codes
- Maintain verification status
- Record verification history
- Publish verification events

---

## Architectural Relationships

### Parent Workspace

Identity Workspace

### Parent Platform Layer

Identity & Trust Engine

### Child Components

- ContactStatus
- ContactPhoneEditor
- ContactOtpVerification

### Planned Components

- EmailVerification
- IdentityVerification

---

## Dependencies

### Internal

- Profile Service
- Notification Service

### External

- SMS Gateway

---

## Produces

- Verified Contact Identity
- Verification Status
- Contact Verification Events

---

## Consumes

- Profile Service
- SMS Service

---

## Public REST Interfaces

### PATCH /profile/contact

Update a user's contact information.

### POST /contact/send-code

Send a one-time verification code.

### POST /contact/verify

Verify a one-time verification code.

---

## Consumers

- Identity Workspace
- Business Workspace
- Future Government Workspace
- Future Partner Portal
- AI Agents

---

## COES Compliance

**Workspace**

Identity

**Layer**

Engine

**Pattern**

Workspace → Engine → Components

**Design Principles**

- Single Responsibility
- Capability Driven
- REST First
- Trust Centric
- Self Describing

---

## Success Criteria

A user can:

- Add a phone number
- Update a phone number
- Receive an SMS verification code
- Verify ownership of a phone number
- View verification status
- Trigger re-verification after changing their phone number

---

## Roadmap

### Current

- Phone Verification

### Next

- Email Verification

### Future

- Government Digital Identity
- Age Verification
- International Identity Providers
- Digital Identity Wallet Integration

---

## Notes

This Engine provides trusted contact verification as a reusable platform capability.

It is intentionally isolated from authentication, user profile management and organisation management.

This separation allows the Engine to be reused across multiple Workspaces while maintaining a clear architectural boundary in accordance with the Community One Engineering Standard (COES).