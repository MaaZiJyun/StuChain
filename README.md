
# A Student Attendance Application Based on NaiveCoin

_Group 9_

**MA Zhiyuan, WANG Zepeng, QIN Cailing, XU Junda, DU Jiahao**  
**Course Number**: COMP5521  

**November 30, 2024**

---

## Table of Contents  

1. [Introduction](#introduction)  
2. [Project Background](#project-background)  
3. [Problem Statement](#problem-statement)  
4. [Objectives](#objectives)  
5. [Literature Review](#literature-review)  
    - [Naivecoin](#naivecoin)  
    - [Blockchain for Education](#blockchain-for-education)  
    - [Blockchain Characteristics](#blockchain-characteristics)  
    - [Previous Research](#previous-research)  
6. [Methodology](#methodology)  
    - [RAD Model](#rad-model)  
    - [System Framework](#system-framework)  
    - [System Analysis and Design](#system-analysis-and-design)  
7. [Development Environment](#development-environment)  
8. [Project Work Division](#project-work-division)  
    - [Implementation and Discussion](#implementation-and-discussion)  
9. [References](#references)  

---

# Introduction

## Project Background
Blockchain has evolved significantly, transitioning from cryptocurrency into numerous real-world applications, including education. Traditional student attendance systems face challenges like inefficiency, potential for data tampering, and poor transparency. This project leverages blockchain, specifically NaiveCoin, to develop a decentralized attendance system with transparent, tamper-proof records.

## Problem Statement
Major problems in current systems:
- Reliance on manual processes prone to errors.
- Susceptibility of centralized systems to tampering, reducing credibility.
- Difficulty in verifying and resolving disputed records.

Limitations of NaiveCoin:
- Lacks user registration and dynamic adjustment mechanisms.
- Lacks resolution strategies for conflicts in multi-node environments.
- Minimalistic on-chain features and unfriendly user interface.

## Objectives
The goal is designing and implementing a secure, blockchain-powered attendance system:
1. Easy-to-use interfaces for attendance recording and querying.
2. Dynamic adjustment of mining difficulty based on system load.
3. Tamper-proof, encrypted attendance data stored on the blockchain.
4. Scalable and decentralized operation using NaiveCoin as the foundation.

---

# Literature Review

## NaiveCoin
NaiveCoin is a lightweight blockchain framework intended for educational purposes, retaining key blockchain features:

- Block structure.
- Proof-of-Work (PoW).
- P2P network communication.
- HTTP API interfaces.

## Blockchain for Education
Prominent use cases include:
- MIT’s blockchain-led Digital Diploma project for secure academic certificates.
- The European Commission’s EBSI initiative for seamless credential recognition across Europe.

## Blockchain Characteristics
Key benefits utilized in the attendance system:
- **Immutable**: Records cannot be erased.
- **Secure**: Cryptography ensures the reliability of stored data.
- **Transparent**: Decentralized validation ensures trustworthiness.

---

# Methodology

## RAD Model Workflow
This project used the Rapid Application Development (RAD) model for rapid—but structured—prototyping and iteration.

### System Framework
The architecture is composed of three layers:
1. **Presentation Layer**: User-side operations.
2. **Application Layer**: Processes attendance data.
3. **Data Layer**: Stores secure, tamper-proof blockchain data.

---

# Development Environment

### Software Used:
- **React Framework**: For building a scalable frontend UI.
- **Next.js**: Simplifies client-side rendering and provides SEO optimization.
- **VS Code**: Simplified software development and debugging.

---

# Implementation and Discussion

Key process highlights include:

### Digital Signature Attendance Implementation
Utilizing:
- Public-private key pairs for user authentication.
- Stable digital signatures for decentralized and tamper-proof attendance records.

### Mining Incentives and Blockchain
Rewards distributed via well-structured mining mechanisms ensure fair contribution incentives for system maintenance.

---

# References

1. Gomes, "Naivecoin: A Tutorial for Developers," GitHub, 2017. [Repository Link](https://github.com/conradoqg/naivecoin)  
2. J. Dunn (2017). "MIT’s Blockchain Diplomas." _MIT News._  
3. European Commission (2023). "Blockchain for Cross-Nation Credentialing."  
4. Arnab et al., "Machine Learning and Blockchain-Based Attendance Systems," 2021.  
5. Webisoft, "Blockchain in Education: Next Steps." 2024.  

---

If you need further sections or edits, feel free to ask!