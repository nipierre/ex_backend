
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { catchError, map, tap } from 'rxjs/operators';

import {
  ContainersPage,
  HostsPage,
  HostConfig,
  Host,
  ContainerResponse
} from './containers_page';

@Injectable()
export class ContainersService {
  private containersUrl = 'api/docker/containers';
  private hostsUrl = 'api/docker/hosts';

  constructor(private http: HttpClient) { }

  getConfigFromHost(host: Host): HostConfig {
    let hostConfig = new HostConfig();
    hostConfig["host"] = host.name;
    hostConfig["port"] = host.port;
    hostConfig["ssl"] = (host.protocol ==  "https");
    return hostConfig;
  }

  getHostFromConfig(hostConfig: HostConfig): Host {
    let host = new Host();
    host["name"] = hostConfig.host;
    host["port"] = hostConfig.port;
    host["protocol"] = hostConfig.ssl ? "https": "http";
    return host;
  }

  getHostsFromConfigs(hostConfigs: HostConfig[]): Host[] {
    let hosts = [];
    for (let hostConfig of hostConfigs) {
      hosts.push(this.getHostFromConfig(hostConfig));
    }
    return hosts;
  }

  getHosts(): Observable<HostsPage> {
    let params = new HttpParams();
    return this.http.get<HostsPage>(this.hostsUrl, {params: params})
      .pipe(
        tap(containerspage => this.log('fetched HostsPage')),
        catchError(this.handleError('getHosts', undefined))
      );
  }

  getContainersForHost(hostConfig: HostConfig): Observable<ContainersPage> {
    let params = new HttpParams();
    params = params.append('host', hostConfig.host);
    params = params.append('port', hostConfig.port.toString());
    params = params.append('ssl', hostConfig.ssl.toString());
    return this.http.get<ContainersPage>(this.containersUrl, {params: params})
      .pipe(
        tap(containerspage => this.log('fetched ContainersPage')),
        catchError(this.handleError('getContainersForHost', undefined))
      );
  }

  getContainers(): Observable<ContainersPage> {
    let params = new HttpParams();
    return this.http.get<ContainersPage>(this.containersUrl, {params: params})
      .pipe(
        tap(containerspage => this.log('fetched ContainersPage')),
        catchError(this.handleError('getContainers', undefined))
      );
  }

  createContainer(host: Host, name: string, params: Object): Observable<ContainerResponse> {
    let hostConfig = this.getConfigFromHost(host);
    return this.http.post<ContainerResponse>(this.containersUrl, {host: hostConfig, name: name, params: params})
      .pipe(
        tap(containerspage => this.log('create Container')),
        catchError(this.handleError('createContainer', undefined))
      );
  }

  removeContainer(hostConfig: HostConfig, id: string): Observable<Object> {
    let params = new HttpParams();
    params = params.append("host", hostConfig.host);
    params = params.append("port", hostConfig.port.toString());
    params = params.append("ssl", hostConfig.ssl.toString());
    return this.http.delete<Object>(this.containersUrl + "/" + id, {params: params})
      .pipe(
        tap(containerspage => this.log('remove Container')),
        catchError(this.handleError('removeContainer', undefined))
      );
  }

  updateContainer(hostConfig: HostConfig, id: string, action: string): Observable<Object> {
    return this.http.put<Object>(this.containersUrl + "/" + id, {host: hostConfig, action: action})
      .pipe(
        tap(containerspage => this.log('update Container')),
        catchError(this.handleError('updateContainer', undefined))
      );
  }

  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      this.log(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }

  private log(message: string) {
    console.log('ContainersService: ' + message);
  }
}
