import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ServiceTypeService } from './service-type.service';
import { ServiceType } from '../models/service-type.model';
import { environment } from '../../../../../environments/environment';

describe('ServiceTypeService', () => {
  let service: ServiceTypeService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ServiceTypeService],
    });
    service = TestBed.inject(ServiceTypeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verify that no unmatched requests are outstanding
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('findAll', () => {
    it('should return an Observable<ServiceType[]>', () => {
      const dummyServiceTypes: ServiceType[] = [
        { id: '1', name: 'Service 1', description: 'Description 1' },
        { id: '2', name: 'Service 2', description: 'Description 2' },
      ];

      service.findAll().subscribe((serviceTypes) => {
        expect(serviceTypes.length).toBe(2);
        expect(serviceTypes).toEqual(dummyServiceTypes);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/ServiceType`);
      expect(req.request.method).toBe('GET');
      req.flush(dummyServiceTypes);
    });
  });

  describe('save', () => {
    it('should create a new ServiceType', () => {
      const newServiceType: ServiceType = {
        name: 'New Service',
        description: 'New Description',
      };
      const savedServiceType: ServiceType = { id: '3', ...newServiceType };

      service.save(newServiceType).subscribe((serviceType) => {
        expect(serviceType).toEqual(savedServiceType);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/ServiceType`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newServiceType);
      req.flush(savedServiceType);
    });
  });

  describe('update', () => {
    it('should update an existing ServiceType', () => {
      const updatedServiceType: ServiceType = {
        id: '1',
        name: 'Updated Service',
        description: 'Updated Description',
      };

      service.update(updatedServiceType).subscribe((serviceType) => {
        expect(serviceType).toEqual(updatedServiceType);
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/ServiceType/${updatedServiceType.id}`
      );
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedServiceType);
      req.flush(updatedServiceType);
    });
  });

  describe('delete', () => {
    it('should delete a ServiceType', () => {
      const id = '1';

      service.delete(id).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/ServiceType/${id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
