{
  description = "A very basic flake";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    yarnpnp2nix.url = "github:madjam002/yarnpnp2nix";
    yarnpnp2nix.inputs.nixpkgs.follows = "nixpkgs";
  };

  outputs = { self, nixpkgs, flake-utils, yarnpnp2nix }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };
      in
      {
        packages =
          let
            mkYarnPackagesFromManifest = yarnpnp2nix.lib."${system}".mkYarnPackagesFromManifest;
            packageOverrides = { };
            yarnPackages = mkYarnPackagesFromManifest {
              yarnManifest = import ./yarn-manifest.nix;
              inherit packageOverrides;
            };
          in
          {
            yarn-plugin = yarnpnp2nix.packages."${pkgs.stdenv.system}".yarn-plugin;
            example = yarnPackages."@puredit/example@workspace:apps/example";
            parser-playground = yarnPackages."@puredit/parser-playground@workspace:apps/parser-playground";
          };
      }
    );
}
