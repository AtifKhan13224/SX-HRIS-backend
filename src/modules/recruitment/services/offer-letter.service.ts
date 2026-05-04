import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OfferLetter } from '../entities/offer-letter.entity';
import { CreateOfferLetterDto, UpdateOfferLetterDto } from '../dto/offer-letter.dto';

@Injectable()
export class OfferLetterService {
  constructor(
    @InjectRepository(OfferLetter)
    private readonly offerLetterRepository: Repository<OfferLetter>,
  ) {}

  async create(createDto: CreateOfferLetterDto, createdBy?: string): Promise<OfferLetter> {
    const existing = await this.offerLetterRepository.findOne({
      where: { offerNumber: createDto.offerNumber },
    });

    if (existing) {
      throw new BadRequestException(`Offer letter with number ${createDto.offerNumber} already exists`);
    }

    const offerLetter = this.offerLetterRepository.create({
      ...createDto,
      createdBy,
    });

    return await this.offerLetterRepository.save(offerLetter);
  }

  async findAll(params?: any): Promise<OfferLetter[]> {
    const {
      candidateId,
      jobOpeningId,
      applicationId,
      status,
      approvalStatus,
    } = params || {};

    const queryBuilder = this.offerLetterRepository.createQueryBuilder('offerLetter')
      .leftJoinAndSelect('offerLetter.candidate', 'candidate')
      .leftJoinAndSelect('offerLetter.jobOpening', 'jobOpening')
      .leftJoinAndSelect('offerLetter.application', 'application');

    if (candidateId) {
      queryBuilder.andWhere('offerLetter.candidateId = :candidateId', { candidateId });
    }

    if (jobOpeningId) {
      queryBuilder.andWhere('offerLetter.jobOpeningId = :jobOpeningId', { jobOpeningId });
    }

    if (applicationId) {
      queryBuilder.andWhere('offerLetter.applicationId = :applicationId', { applicationId });
    }

    if (status) {
      queryBuilder.andWhere('offerLetter.status = :status', { status });
    }

    if (approvalStatus) {
      queryBuilder.andWhere('offerLetter.approvalStatus = :approvalStatus', { approvalStatus });
    }

    return await queryBuilder
      .orderBy('offerLetter.offerDate', 'DESC')
      .getMany();
  }

  async findOne(id: string): Promise<OfferLetter> {
    const offerLetter = await this.offerLetterRepository.findOne({
      where: { id },
      relations: ['candidate', 'jobOpening', 'application'],
    });

    if (!offerLetter) {
      throw new NotFoundException(`Offer letter with ID ${id} not found`);
    }

    return offerLetter;
  }

  async update(id: string, updateDto: UpdateOfferLetterDto, updatedBy?: string): Promise<OfferLetter> {
    const offerLetter = await this.findOne(id);

    Object.assign(offerLetter, { ...updateDto, updatedBy });
    return await this.offerLetterRepository.save(offerLetter);
  }

  async remove(id: string): Promise<void> {
    const offerLetter = await this.findOne(id);
    await this.offerLetterRepository.remove(offerLetter);
  }

  async sendOffer(id: string, sentBy: string): Promise<OfferLetter> {
    const offerLetter = await this.findOne(id);

    offerLetter.isSent = true;
    offerLetter.sentDate = new Date();
    offerLetter.sentBy = sentBy;
    offerLetter.status = 'Sent';

    return await this.offerLetterRepository.save(offerLetter);
  }

  async acceptOffer(id: string): Promise<OfferLetter> {
    const offerLetter = await this.findOne(id);

    offerLetter.isAccepted = true;
    offerLetter.acceptedDate = new Date();
    offerLetter.status = 'Accepted';

    // Calculate days to acceptance
    if (offerLetter.sentDate) {
      const diffTime = Math.abs(new Date().getTime() - offerLetter.sentDate.getTime());
      offerLetter.daysToAcceptance = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    return await this.offerLetterRepository.save(offerLetter);
  }

  async rejectOffer(id: string, reason: string): Promise<OfferLetter> {
    const offerLetter = await this.findOne(id);

    offerLetter.isRejected = true;
    offerLetter.rejectedDate = new Date();
    offerLetter.rejectionReason = reason;
    offerLetter.status = 'Rejected';

    return await this.offerLetterRepository.save(offerLetter);
  }

  async withdrawOffer(id: string, reason: string, withdrawnBy: string): Promise<OfferLetter> {
    const offerLetter = await this.findOne(id);

    offerLetter.isWithdrawn = true;
    offerLetter.withdrawnDate = new Date();
    offerLetter.withdrawalReason = reason;
    offerLetter.withdrawnBy = withdrawnBy;
    offerLetter.status = 'Withdrawn';

    return await this.offerLetterRepository.save(offerLetter);
  }

  async recordJoining(id: string, actualJoiningDate: Date, employeeId: string): Promise<OfferLetter> {
    const offerLetter = await this.findOne(id);

    offerLetter.candidateJoined = true;
    offerLetter.actualJoiningDate = actualJoiningDate;
    offerLetter.employeeId = employeeId;

    // Calculate days to joining
    if (offerLetter.acceptedDate) {
      const diffTime = Math.abs(actualJoiningDate.getTime() - offerLetter.acceptedDate.getTime());
      offerLetter.daysToJoining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    return await this.offerLetterRepository.save(offerLetter);
  }

  async getStats(): Promise<any> {
    const offers = await this.offerLetterRepository.find();

    const total = offers.length;
    const sent = offers.filter(o => o.isSent).length;
    const accepted = offers.filter(o => o.isAccepted).length;
    const rejected = offers.filter(o => o.isRejected).length;
    const withdrawn = offers.filter(o => o.isWithdrawn).length;
    const joined = offers.filter(o => o.candidateJoined).length;

    return {
      total,
      sent,
      accepted,
      rejected,
      withdrawn,
      pending: sent - accepted - rejected - withdrawn,
      joined,
      acceptanceRate: sent > 0 ? (accepted / sent) * 100 : 0,
      joinRate: accepted > 0 ? (joined / accepted) * 100 : 0,
    };
  }

  async generateOfferNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    const count = await this.offerLetterRepository.count();
    const sequence = String(count + 1).padStart(5, '0');
    
    return `OFFER-${year}${month}-${sequence}`;
  }
}
