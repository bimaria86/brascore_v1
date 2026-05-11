<?php
/**
 * BraSCORE Theme Functions
 *
 * @package BraSCORE
 */

if ( ! defined( 'ABSPATH' ) ) exit;

define( 'BRASCORE_VERSION', '1.1.0' );

/* =====================================================================
 *  Enqueue Styles & Scripts
 * ===================================================================== */
function brascore_enqueue() {
    wp_enqueue_style(
        'google-fonts',
        'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap',
        [],
        null
    );
    wp_enqueue_style(
        'brascore-style',
        get_stylesheet_uri(),
        ['google-fonts'],
        BRASCORE_VERSION
    );
    wp_enqueue_script(
        'brascore-main',
        get_template_directory_uri() . '/assets/js/main.js',
        [],
        BRASCORE_VERSION,
        true
    );
}
add_action( 'wp_enqueue_scripts', 'brascore_enqueue' );

/* =====================================================================
 *  Theme Supports & Menus
 * ===================================================================== */
function brascore_setup() {
    add_theme_support( 'title-tag' );
    add_theme_support( 'post-thumbnails' );
    add_theme_support( 'html5', ['search-form','comment-form','comment-list','gallery','caption','script','style'] );
    add_theme_support( 'custom-logo', [
        'height'      => 80,
        'width'       => 200,
        'flex-height' => true,
        'flex-width'  => true,
    ]);

    register_nav_menus([
        'primary' => __( 'Menu Principal', 'brascore' ),
        'footer'  => __( 'Menu Rodapé',    'brascore' ),
    ]);

    load_theme_textdomain( 'brascore', get_template_directory() . '/languages' );
}
add_action( 'after_setup_theme', 'brascore_setup' );

/* =====================================================================
 *  Custom Post Types
 * ===================================================================== */

// --- Publicações ---
function brascore_register_publications() {
    register_post_type( 'publicacao', [
        'labels' => [
            'name'          => 'Publicações',
            'singular_name' => 'Publicação',
            'add_new_item'  => 'Adicionar Publicação',
            'edit_item'     => 'Editar Publicação',
        ],
        'public'       => true,
        'show_in_menu' => true,
        'menu_icon'    => 'dashicons-media-document',
        'supports'     => ['title','editor','custom-fields'],
        'show_in_rest' => true,
        'has_archive'  => false,
        'rewrite'      => [ 'slug' => 'publicacao' ],
    ]);
}
add_action( 'init', 'brascore_register_publications' );

// --- Documentos Técnicos ---
function brascore_register_documents() {
    register_post_type( 'documento', [
        'labels' => [
            'name'          => 'Documentos Técnicos',
            'singular_name' => 'Documento',
            'add_new_item'  => 'Adicionar Documento',
        ],
        'public'       => true,
        'show_in_menu' => true,
        'menu_icon'    => 'dashicons-pdf',
        'supports'     => ['title','editor','custom-fields'],
        'show_in_rest' => true,
        'has_archive'  => false,
        'rewrite'      => [ 'slug' => 'documento' ],
    ]);
}
add_action( 'init', 'brascore_register_documents' );

// --- Membros do Comitê ---
function brascore_register_committee() {
    register_post_type( 'membro_comite', [
        'labels' => [
            'name'          => 'Comitê Científico',
            'singular_name' => 'Membro',
            'add_new_item'  => 'Adicionar Membro',
        ],
        'public'       => true,
        'show_in_menu' => true,
        'menu_icon'    => 'dashicons-groups',
        'supports'     => ['title','editor','thumbnail','custom-fields'],
        'show_in_rest' => true,
        'has_archive'  => true,
        'rewrite'      => [ 'slug' => 'membros-comite' ],
    ]);

    register_taxonomy( 'regiao', 'membro_comite', [
        'labels'            => [ 'name' => 'Regiões', 'singular_name' => 'Região' ],
        'hierarchical'      => true,
        'show_in_rest'      => true,
        'show_admin_column' => true,
    ]);
}
add_action( 'init', 'brascore_register_committee' );

// Cria as 5 regiões automaticamente
function brascore_seed_regions() {
    $regioes = ['Sudeste','Sul','Nordeste','Norte','Centro-Oeste'];
    foreach ( $regioes as $r ) {
        if ( ! term_exists( $r, 'regiao' ) ) {
            wp_insert_term( $r, 'regiao' );
        }
    }
}
add_action( 'init', 'brascore_seed_regions', 20 );

/* =====================================================================
 *  Calculadora — EM BREVE
 *  --------------------------------------------------------------------
 *  O handler AJAX da calculadora foi REMOVIDO até que o modelo final
 *  do BraSCORE seja publicado. A página /calculadora/ exibe apenas a
 *  versão "Em Breve". Quando os coeficientes forem definidos, basta
 *  reativar o handler aqui (wp_ajax_brascore_calc / nopriv).
 * ===================================================================== */

/* =====================================================================
 *  Login Institucional (shortcode)
 * ===================================================================== */
function brascore_login_shortcode() {
    if ( is_user_logged_in() ) {
        $url = home_url( '/area-restrita/' );
        return '<a href="' . esc_url( $url ) . '" class="btn btn--primary">Acessar painel institucional</a>';
    }
    ob_start(); ?>
    <div class="login-card">
        <h3>Acesso institucional</h3>
        <?php wp_login_form([
            'label_username' => 'E-mail institucional',
            'label_password' => 'Senha',
            'label_log_in'   => 'Entrar',
            'remember'       => true,
            'redirect'       => home_url( '/area-restrita/' ),
        ]); ?>
        <p class="login-access-note">
            Acesso exclusivo para hospitais e instituições cadastradas.<br>
            <a href="<?php echo esc_url( wp_lostpassword_url() ); ?>">Esqueceu a senha?</a>
        </p>
    </div>
    <?php return ob_get_clean();
}
add_shortcode( 'brascore_login', 'brascore_login_shortcode' );

/* =====================================================================
 *  Proteção da Área Restrita
 *  --------------------------------------------------------------------
 *  Atualmente a página /area-restrita/ exibe apenas o aviso "Em Breve".
 *  Quando a plataforma estiver ativa, descomente a verificação abaixo.
 * ===================================================================== */
function brascore_protect_restricted() {
    // if ( is_page( 'area-restrita' ) && ! is_user_logged_in() ) {
    //     wp_redirect( wp_login_url( get_permalink() ) );
    //     exit;
    // }
}
add_action( 'template_redirect', 'brascore_protect_restricted' );

/* =====================================================================
 *  Formulário: Cadastro de Colegas
 *  --------------------------------------------------------------------
 *  Salva como CPT privado 'cadastro_colega' e envia notificação por
 *  e-mail à coordenação.
 * ===================================================================== */
function brascore_register_cadastro_cpt() {
    register_post_type( 'cadastro_colega', [
        'labels' => [
            'name'          => 'Cadastros',
            'singular_name' => 'Cadastro',
        ],
        'public'             => false,
        'show_ui'            => true,
        'show_in_menu'       => true,
        'menu_icon'          => 'dashicons-id',
        'supports'           => ['title','custom-fields'],
        'capability_type'    => 'post',
        'publicly_queryable' => false,
    ]);
}
add_action( 'init', 'brascore_register_cadastro_cpt' );

function brascore_handle_cadastro() {
    if ( ! isset( $_POST['brascore_cadastro_nonce'] ) ||
         ! wp_verify_nonce( $_POST['brascore_cadastro_nonce'], 'brascore_cadastro' ) ) {
        wp_die( 'Verificação de segurança falhou.' );
    }

    if ( empty( $_POST['lgpd'] ) ) {
        wp_redirect( add_query_arg( 'cadastro', 'erro_lgpd', home_url( '/cadastro/' ) ) );
        exit;
    }

    $nome          = sanitize_text_field( $_POST['nome']          ?? '' );
    $email         = sanitize_email(      $_POST['email']         ?? '' );
    $cpf           = sanitize_text_field( $_POST['cpf']           ?? '' );
    $instituicao   = sanitize_text_field( $_POST['instituicao']   ?? '' );
    $cidade        = sanitize_text_field( $_POST['cidade']        ?? '' );
    $estado        = sanitize_text_field( $_POST['estado']        ?? '' );
    $profissao     = sanitize_text_field( $_POST['profissao']     ?? '' );
    $especialidade = sanitize_text_field( $_POST['especialidade'] ?? '' );
    $lattes        = esc_url_raw(         $_POST['lattes']        ?? '' );
    $interesses    = is_array( $_POST['interesse'] ?? null )
        ? array_map( 'sanitize_text_field', $_POST['interesse'] )
        : [];

    if ( empty( $nome ) || empty( $email ) || empty( $instituicao )
         || empty( $cidade ) || empty( $estado ) || empty( $profissao ) ) {
        wp_redirect( add_query_arg( 'cadastro', 'erro_campos', home_url( '/cadastro/' ) ) );
        exit;
    }

    $post_id = wp_insert_post([
        'post_type'   => 'cadastro_colega',
        'post_status' => 'private',
        'post_title'  => $nome . ' — ' . $instituicao,
        'meta_input'  => [
            'email'         => $email,
            'cpf'           => $cpf,
            'instituicao'   => $instituicao,
            'cidade'        => $cidade,
            'estado'        => $estado,
            'profissao'     => $profissao,
            'especialidade' => $especialidade,
            'lattes'        => $lattes,
            'interesses'    => implode( ', ', $interesses ),
            'lgpd'          => 'Aceito em ' . current_time( 'mysql' ),
            'ip'            => sanitize_text_field( $_SERVER['REMOTE_ADDR'] ?? '' ),
        ],
    ]);

    // Notificação para a coordenação
    $admin_email = get_option( 'admin_email' );
    $titulo  = '[BraSCORE] Novo cadastro: ' . $nome;
    $corpo   = "Novo cadastro recebido no site BraSCORE.\n\n";
    $corpo  .= "Nome: $nome\n";
    $corpo  .= "E-mail: $email\n";
    $corpo  .= "Instituição: $instituicao\n";
    $corpo  .= "Cidade/UF: $cidade / $estado\n";
    $corpo  .= "Profissão: $profissao\n";
    if ( $especialidade ) $corpo .= "Especialidade: $especialidade\n";
    if ( $lattes )        $corpo .= "Lattes/ORCID: $lattes\n";
    if ( $interesses )    $corpo .= "Interesses: " . implode( ', ', $interesses ) . "\n";
    if ( $post_id ) {
        $corpo .= "\nAcesse o painel WP em: " . admin_url( "post.php?post={$post_id}&action=edit" );
    }
    wp_mail( $admin_email, $titulo, $corpo );

    wp_redirect( add_query_arg( 'cadastro', 'sucesso', home_url( '/cadastro/' ) ) );
    exit;
}
add_action( 'admin_post_nopriv_brascore_cadastro', 'brascore_handle_cadastro' );
add_action( 'admin_post_brascore_cadastro',        'brascore_handle_cadastro' );

/* =====================================================================
 *  Formulário: Contato
 * ===================================================================== */
function brascore_handle_contato() {
    if ( ! isset( $_POST['brascore_contato_nonce'] ) ||
         ! wp_verify_nonce( $_POST['brascore_contato_nonce'], 'brascore_contato' ) ) {
        wp_die( 'Verificação de segurança falhou.' );
    }

    if ( empty( $_POST['lgpd'] ) ) {
        wp_redirect( add_query_arg( 'contato', 'erro_lgpd', home_url( '/contato/' ) ) );
        exit;
    }

    $nome        = sanitize_text_field(     $_POST['nome']        ?? '' );
    $email       = sanitize_email(          $_POST['email']       ?? '' );
    $instituicao = sanitize_text_field(     $_POST['instituicao'] ?? '' );
    $assunto_in  = sanitize_text_field(     $_POST['assunto']     ?? '' );
    $mensagem    = sanitize_textarea_field( $_POST['mensagem']    ?? '' );

    if ( empty( $nome ) || empty( $email ) || empty( $assunto_in ) || empty( $mensagem ) ) {
        wp_redirect( add_query_arg( 'contato', 'erro_campos', home_url( '/contato/' ) ) );
        exit;
    }

    $admin_email = get_option( 'admin_email' );
    $titulo  = '[BraSCORE — Contato] ' . $assunto_in . ' — ' . $nome;
    $corpo   = "Mensagem recebida via formulário de contato.\n\n";
    $corpo  .= "Nome: $nome\n";
    $corpo  .= "E-mail: $email\n";
    if ( $instituicao ) $corpo .= "Instituição: $instituicao\n";
    $corpo  .= "Assunto: $assunto_in\n\n";
    $corpo  .= "Mensagem:\n$mensagem\n";

    $headers = [ 'Reply-To: ' . $nome . ' <' . $email . '>' ];
    wp_mail( $admin_email, $titulo, $corpo, $headers );

    wp_redirect( add_query_arg( 'contato', 'sucesso', home_url( '/contato/' ) ) );
    exit;
}
add_action( 'admin_post_nopriv_brascore_contato', 'brascore_handle_contato' );
add_action( 'admin_post_brascore_contato',        'brascore_handle_contato' );

/* =====================================================================
 *  Segurança & Limpeza
 * ===================================================================== */
remove_action( 'wp_head', 'wp_generator' );
remove_action( 'wp_head', 'rsd_link' );
remove_action( 'wp_head', 'wlwmanifest_link' );

// Esconde a versão do WP em scripts/styles
function brascore_remove_version( $src ) {
    if ( strpos( $src, 'ver=' ) ) {
        $src = remove_query_arg( 'ver', $src );
    }
    return $src;
}
add_filter( 'style_loader_src',  'brascore_remove_version', 9999 );
add_filter( 'script_loader_src', 'brascore_remove_version', 9999 );
