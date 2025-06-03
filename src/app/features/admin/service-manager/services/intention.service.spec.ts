import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { IntentionService } from './intention.service';
import { Intention } from '../models/intention.model';
import { environment } from '../../../../../environments/environment';

describe('IntentionService', () => {
  let service: IntentionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [IntentionService],
    });
    service = TestBed.inject(IntentionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('findAll', () => {
    it('should return an Observable<Intention[]>', () => {
      const dummyIntentions: Intention[] = [
        {
          id: '1',
          name: 'Intention 1',
          description: 'Description 1',
          serviceTypeId: 1,
          serviceTypeName: 'Service Type 1',
          limit_Area: 100,
          daily_Price: 50,
          urbanConfrontation: true,
          ruralConfrontation: false,
        },
        {
          id: '2',
          name: 'Intention 2',
          description: 'Description 2',
          serviceTypeId: 2,
          serviceTypeName: 'Service Type 2',
          limit_Area: 200,
          daily_Price: 75,
          urbanConfrontation: false,
          ruralConfrontation: true,
        },
      ];

      service.findAll().subscribe((intentions) => {
        expect(intentions.length).toBe(2);
        expect(intentions).toEqual(dummyIntentions);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/IntentionService`);
      expect(req.request.method).toBe('GET');
      req.flush(dummyIntentions);
    });
  });

  describe('save', () => {
    it('should create a new Intention', () => {
      const newIntention: Intention = {
        name: 'New Intention',
        description: 'New Description',
        serviceTypeId: 1,
        serviceTypeName: 'Service Type 1',
        limit_Area: 150,
        daily_Price: 60,
        urbanConfrontation: true,
        ruralConfrontation: true,
      };
      const savedIntention: Intention = { id: '3', ...newIntention };

      service.save(newIntention).subscribe((intention) => {
        expect(intention).toEqual(savedIntention);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/IntentionService`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newIntention);
      req.flush(savedIntention);
    });
  });

  describe('update', () => {
    it('should update an existing Intention', () => {
      const updatedIntention: Intention = {
        id: '1',
        name: 'Updated Intention',
        description: 'Updated Description',
        serviceTypeId: 2,
        serviceTypeName: 'Service Type 2',
        limit_Area: 300,
        daily_Price: 100,
        urbanConfrontation: false,
        ruralConfrontation: false,
      };

      service.update(updatedIntention).subscribe((intention) => {
        expect(intention).toEqual(updatedIntention);
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/IntentionService/${updatedIntention.id}`
      );
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedIntention);
      req.flush(updatedIntention);
    });
  });

  describe('delete', () => {
    it('should delete an Intention', () => {
      const id = '1';

      service.delete(id).subscribe();

      const req = httpMock.expectOne(
        `${environment.apiUrl}/IntentionService/${id}`
      );
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
