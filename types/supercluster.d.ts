/**
 * Type definitions for supercluster map marker clustering
 * Based on actual usage in components/browse/map-view.tsx
 */

declare module 'supercluster' {
  interface ClusterOptions {
    /** Cluster radius in pixels (default: 40) */
    radius?: number
    /** Maximum zoom level to cluster at (default: 16) */
    maxZoom?: number
    /** Minimum zoom level to cluster at (default: 0) */
    minZoom?: number
    /** Minimum number of points to form a cluster (default: 2) */
    minPoints?: number
  }

  interface PointFeature<P = any> {
    type: 'Feature'
    properties: P
    geometry: {
      type: 'Point'
      coordinates: [number, number]
    }
  }

  interface ClusterFeature {
    type: 'Feature'
    id?: number
    properties: {
      cluster: boolean
      cluster_id?: number
      point_count?: number
      point_count_abbreviated?: string | number
      [key: string]: any
    }
    geometry: {
      type: 'Point'
      coordinates: [number, number]
    }
  }

  type BBox = [number, number, number, number] // [west, south, east, north]

  export default class Supercluster<P = any> {
    constructor(options?: ClusterOptions)

    /**
     * Load an array of GeoJSON point features
     */
    load(points: PointFeature<P>[]): this

    /**
     * Get clusters for a bounding box and zoom level
     */
    getClusters(bbox: BBox, zoom: number): Array<ClusterFeature | PointFeature<P>>

    /**
     * Get the zoom level at which a cluster expands into separate points
     */
    getClusterExpansionZoom(clusterId: number): number

    /**
     * Get all points within a cluster
     */
    getLeaves(clusterId: number, limit?: number, offset?: number): PointFeature<P>[]

    /**
     * Get children of a cluster
     */
    getChildren(clusterId: number): Array<ClusterFeature | PointFeature<P>>
  }
}
