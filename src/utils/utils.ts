class Utils {
  public static MESH_EXTENSIONS: string[] = [
    'fbx',
    'gltf',
    'glb',
    'babylon',
    'obj',
    'stl',
  ];

  public static GetFileExtension(filename: string): string {
    return filename.split('.').pop() ?? '';
  }

  public static Is3DModelFile(filename: string) {
    return Utils.MESH_EXTENSIONS.includes(this.GetFileExtension(filename));
  }
}

export default Utils;
