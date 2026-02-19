
export interface Slide {
    id: number;
    image_path: string | null;
    bg_text?: string | null;
    bg_color?: string | null;
    title: string | null;
    description: string | null;
    button_text: string | null;
    button_link: string | null;
    content_position: string;
    btn_pos_type?: string; 
    btn_relative_pos?: string;
    btn_custom_pos?: string;
    text_color: string;
    text_size?: string;
    button_color?: string;
    button_bg_color?: string;
    button_size?: 'sm' | 'md' | 'lg' | 'xl';
    text_anim_in?: string;
    text_anim_out?: string;
    btn_anim_in?: string;
    btn_anim_out?: string;
    anim_speed?: string;
}

export interface SliderSettings {
    id: number;
    title: string;
    height_class: string;
    border_radius?: string;
    interval: number;
    effect?: string; 
    slides_per_view?: number;
    active_slides?: Slide[]; 
    
    loop?: boolean;
    direction?: string; 
    border_width?: string;
    border_color?: string;
    gap?: number;
    gap_color?: string;
}
