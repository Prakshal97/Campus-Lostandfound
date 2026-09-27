const bcrypt = require('bcryptjs');

class DataStore {
  constructor() {
    this.resetStore();
  }

  resetStore() {
    this.users = [
      {
        _id: 'user_aanya',
        name: 'Aanya Sharma',
        email: 'aanya.sharma@college.edu',
        role: 'student',
        verified: true,
        createdAt: new Date().toISOString()
      },
      {
        _id: 'user_rohan',
        name: 'Rohan Verma',
        email: 'rohan.verma@college.edu',
        role: 'student',
        verified: true,
        createdAt: new Date().toISOString()
      },
      {
        _id: 'user_patil',
        name: 'Mr. Patil (Security)',
        email: 'patil.security@college.edu',
        role: 'admin',
        verified: true,
        createdAt: new Date().toISOString()
      }
    ];

    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
    const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();

    const answerHash = bcrypt.hashSync('spaceman', 10);

    this.items = [
      {
        _id: 'item_lost_earphones',
        type: 'lost',
        title: 'Sony WF-1000XM4 Wireless Earphones',
        description: 'Black noise cancelling earbuds in original matte black charging case with a small spaceman sticker on the back side.',
        category: 'electronics',
        colour: 'Black',
        brand: 'Sony',
        tags: ['earphones', 'sony', 'wireless', 'earbuds', 'black'],
        location: 'canteen',
        eventDate: twoHoursAgo,
        imageUrl: '/assets/demo_earphones.jpg',
        isSensitive: false,
        custody: 'with me',
        status: 'Matched',
        reportedBy: 'user_aanya',
        createdAt: twoHoursAgo,
        expiresAt: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: 'item_found_earphones',
        type: 'found',
        title: 'Sony Noise-Cancelling Earbuds in Charging Case',
        description: 'Found black charging case with wireless earphones inside on a table near the main cashier section in Canteen.',
        category: 'electronics',
        colour: 'Black',
        brand: 'Sony',
        tags: ['earphones', 'sony', 'charging', 'case', 'black', 'canteen'],
        location: 'canteen',
        eventDate: oneHourAgo,
        imageUrl: '/assets/demo_earphones.jpg',
        isSensitive: false,
        custody: 'at desk',
        verifyQuestion: 'What sticker or unique mark is on the back of the charging case?',
        verifyAnswerHash: answerHash,
        status: 'Matched',
        reportedBy: 'user_rohan',
        createdAt: oneHourAgo,
        expiresAt: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: 'item_found_calculator',
        type: 'found',
        title: 'Casio FX-991EX Scientific Calculator',
        description: 'Left behind on Desk 4 in Engineering Lab 3 after afternoon practical session. Has name initials "R.V." written inside sliding cover.',
        category: 'electronics',
        colour: 'Black',
        brand: 'Casio',
        tags: ['calculator', 'casio', 'scientific', 'lab', 'engineering'],
        location: 'lab_block',
        eventDate: threeDaysAgo,
        imageUrl: '/assets/demo_calculator.jpg',
        isSensitive: false,
        custody: 'with me',
        verifyQuestion: 'What initials are written on the inside of the calculator cover?',
        verifyAnswerHash: bcrypt.hashSync('R.V.', 10),
        status: 'Reported',
        reportedBy: 'user_rohan',
        createdAt: threeDaysAgo,
        expiresAt: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: 'item_lost_id',
        type: 'lost',
        title: 'Student ID Card & Metro Pass',
        description: 'Lost leather cardholder containing Student ID card and blue city metro smartcard in Central Library study hall.',
        category: 'ID/cards',
        colour: 'Brown',
        brand: 'Leather',
        tags: ['id', 'card', 'student', 'metro', 'library'],
        location: 'library',
        eventDate: twoHoursAgo,
        imageUrl: '/assets/demo_id.jpg',
        isSensitive: true,
        custody: 'with me',
        status: 'Reported',
        reportedBy: 'user_aanya',
        createdAt: twoHoursAgo,
        expiresAt: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: 'item_found_bottle',
        type: 'found',
        title: 'Milton Thermosteel Water Bottle 1L',
        description: 'Stainless steel insulated bottle with yellow rubber strap found near basketball court bleachers.',
        category: 'bottles',
        colour: 'Silver',
        brand: 'Milton',
        tags: ['bottle', 'milton', 'water', 'silver', 'sports'],
        location: 'sports_complex',
        eventDate: threeDaysAgo,
        imageUrl: '/assets/demo_bottle.jpg',
        isSensitive: false,
        custody: 'at desk',
        verifyQuestion: 'What color is the rubber carrying strap on the bottle handle?',
        verifyAnswerHash: bcrypt.hashSync('yellow', 10),
        status: 'AtDesk',
        reportedBy: 'user_patil',
        createdAt: threeDaysAgo,
        expiresAt: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    const sampleOtpHash = bcrypt.hashSync('4829', 10);

    this.claims = [
      {
        _id: 'claim_earphones_01',
        item: 'item_found_earphones',
        claimant: 'user_aanya',
        answer: 'spaceman',
        markDescription: 'Small spaceman astronaut sticker on the rear hinge of the charging case.',
        status: 'verified',
        otp: sampleOtpHash,
        rawOtp: '4829', // For demo display convenience
        decidedBy: 'user_patil',
        decidedAt: new Date().toISOString(),
        createdAt: oneHourAgo
      }
    ];

    this.auditLogs = [
      {
        _id: 'log_01',
        action: 'REPORTED',
        actor: 'user_aanya',
        item: 'item_lost_earphones',
        timestamp: twoHoursAgo,
        meta: { type: 'lost', location: 'canteen' }
      },
      {
        _id: 'log_02',
        action: 'REPORTED',
        actor: 'user_rohan',
        item: 'item_found_earphones',
        timestamp: oneHourAgo,
        meta: { type: 'found', custody: 'at desk' }
      },
      {
        _id: 'log_03',
        action: 'MATCH_SUGGESTED',
        actor: 'SYSTEM',
        item: 'item_lost_earphones',
        timestamp: oneHourAgo,
        meta: { matchedWith: 'item_found_earphones', score: 87 }
      },
      {
        _id: 'log_04',
        action: 'CLAIM_SUBMITTED',
        actor: 'user_aanya',
        item: 'item_found_earphones',
        timestamp: oneHourAgo,
        meta: { claimId: 'claim_earphones_01' }
      },
      {
        _id: 'log_05',
        action: 'CLAIM_VERIFIED',
        actor: 'user_patil',
        item: 'item_found_earphones',
        timestamp: new Date().toISOString(),
        meta: { claimId: 'claim_earphones_01', otpGenerated: true }
      }
    ];

    this.notifications = [
      {
        _id: 'notif_01',
        userId: 'user_aanya',
        title: '🎯 High Match Found! (87%)',
        message: 'A found report matching your lost Sony WF-1000XM4 Earphones was logged at Student Canteen!',
        itemId: 'item_found_earphones',
        read: false,
        createdAt: oneHourAgo
      },
      {
        _id: 'notif_02',
        userId: 'user_aanya',
        title: '✅ Claim Approved - OTP Issued',
        message: 'Your claim for Sony Noise-Cancelling Earbuds has been approved by Mr. Patil. Use Handover OTP: 4829 at Security Desk.',
        itemId: 'item_found_earphones',
        read: false,
        createdAt: new Date().toISOString()
      }
    ];
  }

  // Items CRUD
  getItems(filters = {}) {
    let list = [...this.items];

    if (filters.type) {
      list = list.filter(i => i.type === filters.type);
    }
    if (filters.category) {
      list = list.filter(i => i.category.toLowerCase() === filters.category.toLowerCase());
    }
    if (filters.location) {
      list = list.filter(i => i.location.toLowerCase() === filters.location.toLowerCase());
    }
    if (filters.status) {
      list = list.filter(i => i.status.toLowerCase() === filters.status.toLowerCase());
    }
    if (filters.q) {
      const q = filters.q.toLowerCase();
      list = list.filter(i => 
        i.title.toLowerCase().includes(q) || 
        i.description.toLowerCase().includes(q) ||
        (i.colour && i.colour.toLowerCase().includes(q)) ||
        (i.brand && i.brand.toLowerCase().includes(q))
      );
    }

    // Sort by newest first
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return list;
  }

  getItemById(id) {
    return this.items.find(i => i._id === id);
  }

  addItem(itemData) {
    const newItem = {
      _id: 'item_' + Date.now(),
      status: itemData.type === 'found' && itemData.custody === 'at desk' ? 'AtDesk' : 'Reported',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      imageUrl: itemData.imageUrl || '/assets/placeholder_item.jpg',
      tags: Array.from(new Set(`${itemData.title} ${itemData.description}`.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2))),
      ...itemData
    };

    if (newItem.verifyAnswer) {
      newItem.verifyAnswerHash = bcrypt.hashSync(newItem.verifyAnswer.toLowerCase().trim(), 10);
      delete newItem.verifyAnswer;
    }

    this.items.unshift(newItem);

    // Create Audit Log
    this.addAuditLog({
      action: 'REPORTED',
      actor: newItem.reportedBy || 'SYSTEM',
      item: newItem._id,
      meta: { type: newItem.type, location: newItem.location }
    });

    return newItem;
  }

  updateItemStatus(id, newStatus, actorId) {
    const item = this.getItemById(id);
    if (!item) return null;
    const oldStatus = item.status;
    item.status = newStatus;

    this.addAuditLog({
      action: `STATUS_CHANGED_${newStatus.toUpperCase()}`,
      actor: actorId || 'SYSTEM',
      item: id,
      meta: { oldStatus, newStatus }
    });

    return item;
  }

  // Claims
  addClaim(claimData) {
    const newClaim = {
      _id: 'claim_' + Date.now(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...claimData
    };
    this.claims.unshift(newClaim);

    // Update item status to ClaimPending
    this.updateItemStatus(claimData.item, 'ClaimPending', claimData.claimant);

    this.addAuditLog({
      action: 'CLAIM_SUBMITTED',
      actor: claimData.claimant,
      item: claimData.item,
      meta: { claimId: newClaim._id }
    });

    return newClaim;
  }

  getClaimsForItem(itemId) {
    return this.claims.filter(c => c.item === itemId);
  }

  getClaimById(id) {
    return this.claims.find(c => c._id === id);
  }

  approveClaim(claimId, decidedBy) {
    const claim = this.getClaimById(claimId);
    if (!claim) return null;

    // Generate 4-digit OTP
    const rawOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpHash = bcrypt.hashSync(rawOtp, 10);

    claim.status = 'verified';
    claim.otp = otpHash;
    claim.rawOtp = rawOtp;
    claim.decidedBy = decidedBy;
    claim.decidedAt = new Date().toISOString();

    // Update item status to Verified
    this.updateItemStatus(claim.item, 'Verified', decidedBy);

    // Notify claimant
    const item = this.getItemById(claim.item);
    this.addNotification({
      userId: claim.claimant,
      title: '✅ Claim Approved - OTP Issued',
      message: `Your claim for "${item ? item.title : 'item'}" has been approved! Present OTP ${rawOtp} at custody desk.`,
      itemId: claim.item
    });

    this.addAuditLog({
      action: 'CLAIM_APPROVED',
      actor: decidedBy,
      item: claim.item,
      meta: { claimId, rawOtp }
    });

    return { claim, rawOtp };
  }

  rejectClaim(claimId, decidedBy) {
    const claim = this.getClaimById(claimId);
    if (!claim) return null;
    claim.status = 'rejected';
    claim.decidedBy = decidedBy;
    claim.decidedAt = new Date().toISOString();

    // Revert item status to Matched/Reported
    const item = this.getItemById(claim.item);
    if (item) {
      this.updateItemStatus(claim.item, item.custody === 'at desk' ? 'AtDesk' : 'Reported', decidedBy);
    }

    this.addAuditLog({
      action: 'CLAIM_REJECTED',
      actor: decidedBy,
      item: claim.item,
      meta: { claimId }
    });

    return claim;
  }

  verifyHandover(claimId, enteredOtp, actorId) {
    const claim = this.getClaimById(claimId);
    if (!claim) return { success: false, message: 'Claim not found' };
    if (claim.status !== 'verified') return { success: false, message: 'Claim is not in verified state' };

    // Check OTP match
    const isMatch = claim.rawOtp === enteredOtp.trim() || (claim.otp && bcrypt.compareSync(enteredOtp.trim(), claim.otp));
    if (!isMatch) {
      return { success: false, message: 'Invalid 4-digit OTP. Please double check.' };
    }

    claim.status = 'completed';
    const item = this.getItemById(claim.item);
    if (item) {
      item.status = 'Returned';
    }

    this.addNotification({
      userId: claim.claimant,
      title: '🎉 Item Successfully Returned!',
      message: `Item "${item ? item.title : ''}" handover has been verified and completed!`,
      itemId: claim.item
    });

    this.addAuditLog({
      action: 'HANDOVER_COMPLETED',
      actor: actorId || 'SYSTEM',
      item: claim.item,
      meta: { claimId }
    });

    return { success: true, item, claim };
  }

  // Audit & Notifications
  addAuditLog(logData) {
    const log = {
      _id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString(),
      ...logData
    };
    this.auditLogs.unshift(log);
    return log;
  }

  getAuditLogs(itemId) {
    if (itemId) return this.auditLogs.filter(l => l.item === itemId);
    return this.auditLogs;
  }

  addNotification(notifData) {
    const notif = {
      _id: 'notif_' + Date.now(),
      read: false,
      createdAt: new Date().toISOString(),
      ...notifData
    };
    this.notifications.unshift(notif);
    return notif;
  }

  getUserNotifications(userId) {
    return this.notifications.filter(n => n.userId === userId || userId === 'all');
  }

  markNotificationRead(notifId) {
    const n = this.notifications.find(x => x._id === notifId);
    if (n) n.read = true;
    return n;
  }

  // Admin Statistics
  getAdminStats() {
    const total = this.items.length;
    const lostCount = this.items.filter(i => i.type === 'lost').length;
    const foundCount = this.items.filter(i => i.type === 'found').length;
    const returnedCount = this.items.filter(i => i.status === 'Returned').length;
    const deskCount = this.items.filter(i => i.custody === 'at desk' && i.status !== 'Returned').length;
    const pendingClaimsCount = this.claims.filter(c => c.status === 'pending').length;
    
    // Recovery rate percentage
    const recoveryRate = lostCount > 0 ? Math.round((returnedCount / (lostCount + returnedCount)) * 100) : 75;

    // Campus zone density breakdown for heatmap
    const zoneCounts = {};
    this.items.forEach(i => {
      zoneCounts[i.location] = (zoneCounts[i.location] || 0) + 1;
    });

    return {
      total,
      lostCount,
      foundCount,
      returnedCount,
      deskCount,
      pendingClaimsCount,
      recoveryRate,
      zoneCounts
    };
  }
}

const store = new DataStore();
module.exports = store;
