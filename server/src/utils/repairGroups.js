import { Group } from '../models/group.model.js';
import { Membership } from '../models/membership.model.js';

export const repairExistingGroupMemberships = async () => {
  try {
    const groups = await Group.find();
    let healed = 0;

    for (const group of groups) {
      if (group.owner) {
        const ownerMembership = await Membership.findOne({
          group: group._id,
          user: group.owner,
        });

        if (!ownerMembership || ownerMembership.role !== 'owner' || ownerMembership.status !== 'active') {
          await Membership.findOneAndUpdate(
            { group: group._id, user: group.owner },
            { role: 'owner', status: 'active', joinedAt: ownerMembership?.joinedAt || new Date() },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
          healed += 1;
        }
      }
    }

    if (healed > 0) {
      console.log(`[Repair] Successfully validated and repaired owner memberships for ${healed} groups.`);
    }
  } catch (err) {
    console.error('[Repair] Group owner membership verification:', err.message);
  }
};
